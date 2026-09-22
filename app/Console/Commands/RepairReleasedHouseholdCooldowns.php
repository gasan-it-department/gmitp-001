<?php

namespace App\Console\Commands;

use App\Core\ActionCenter\Enums\AssistanceCooldownScope;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class RepairReleasedHouseholdCooldowns extends Command
{
    private const SOURCE = 'action-center:repair-released-household-cooldowns';

    protected $signature = 'action-center:repair-released-household-cooldowns
        {--municipality= : Municipality id, slug, or municipal code}
        {--dry-run : Explicitly audit without changing data}
        {--apply : Apply reviewed household-scope repairs}';

    protected $description = 'Audit or convert released Action Center cooldowns to household scope';

    public function handle(LockActionCenterMunicipalityAction $lockMunicipality): int
    {
        if ($this->option('apply') && $this->option('dry-run')) {
            $this->error('Choose either --apply or --dry-run, not both.');

            return self::INVALID;
        }

        $municipalityOption = $this->option('municipality');
        $municipalId = $this->resolveMunicipalId($municipalityOption);

        if (is_string($municipalityOption) && trim($municipalityOption) !== '' && $municipalId === null) {
            $this->error('The municipality filter did not match an existing municipality.');

            return self::FAILURE;
        }

        if ($this->option('apply') && $municipalId === null) {
            $this->error('The --municipality option is required when using --apply.');

            return self::INVALID;
        }

        $state = $this->loadState($municipalId);
        $this->renderAudit($state);

        if ($state['blocking_errors']->isNotEmpty()) {
            $this->error(sprintf(
                'Found %d blocking anomaly/anomalies. No changes were made.',
                $state['blocking_errors']->count(),
            ));

            return self::FAILURE;
        }

        if (! $this->option('apply')) {
            $this->info(sprintf(
                'Read-only audit: %d assistance type(s) and %d released request(s) require repair. Use --apply after review.',
                $state['types_to_repair']->count(),
                $state['requests_to_repair']->count(),
            ));

            return self::SUCCESS;
        }

        try {
            $result = DB::transaction(function () use ($municipalId, $lockMunicipality): array {
                $lockMunicipality->execute($municipalId);
                $lockedState = $this->loadState($municipalId, lockRows: true);

                if ($lockedState['blocking_errors']->isNotEmpty()) {
                    throw new \DomainException(
                        'Cooldown data changed or contains blocking anomalies. Rerun the audit and review its findings.',
                    );
                }

                $typeRepairs = $this->repairAssistanceTypes($lockedState['types_to_repair']);
                $requestRepairs = $this->repairReleasedRequests($lockedState['requests_to_repair']);

                return [
                    'types' => $typeRepairs,
                    'requests' => $requestRepairs['requests'],
                    'cooldown_rows' => $requestRepairs['cooldown_rows'],
                ];
            }, attempts: 3);
        } catch (Throwable $exception) {
            report($exception);
            $this->error($exception->getMessage());
            $this->error('The transaction was rolled back; no partial repair was retained.');

            return self::FAILURE;
        }

        $this->info(sprintf(
            'Repaired %d assistance type(s), %d released request(s), and %d cooldown row household link(s). Rerunning is safe.',
            $result['types'],
            $result['requests'],
            $result['cooldown_rows'],
        ));

        return self::SUCCESS;
    }

    /**
     * @return array{
     *     types: Collection<int, AssistanceType>,
     *     types_to_repair: Collection<int, AssistanceType>,
     *     analyses: Collection<int, array<string, mixed>>,
     *     requests_to_repair: Collection<int, array<string, mixed>>,
     *     blocking_errors: Collection<int, string>
     * }
     */
    private function loadState(?string $municipalId, bool $lockRows = false): array
    {
        $requestQuery = AssistanceRequest::query()
            ->where('status', AssistanceStatus::Released->value)
            ->when($municipalId, fn ($query) => $query->where('municipal_id', $municipalId))
            ->orderBy('id');

        if ($lockRows) {
            $requestQuery->lockForUpdate();
        }

        $requests = $requestQuery->get();
        $requestIds = $requests->pluck('id')->all();

        $cooldownQuery = BeneficiaryCooldown::query()
            ->whereIn('assistance_request_id', $requestIds)
            ->orderBy('id');

        if ($lockRows && $requestIds !== []) {
            $cooldownQuery->lockForUpdate();
        }

        $cooldownsByRequest = $cooldownQuery->get()->groupBy('assistance_request_id');

        $typeQuery = AssistanceType::withTrashed()
            ->when($municipalId, fn ($query) => $query->where('municipal_id', $municipalId))
            ->orderBy('id');

        if ($lockRows) {
            $typeQuery->lockForUpdate();
        }

        $types = $typeQuery->get();
        $typesById = $types->keyBy('id');
        $typesToRepair = $types->filter(
            fn (AssistanceType $type): bool => $type->deleted_at === null
                && ($type->cooldown_scope !== AssistanceCooldownScope::Household->value
                    || $type->is_independent),
        )->values();

        $analyses = $requests->map(function (AssistanceRequest $request) use (
            $typesById,
            $cooldownsByRequest,
        ): array {
            /** @var AssistanceType|null $type */
            $type = $typesById->get($request->assistance_type_id);
            /** @var Collection<int, BeneficiaryCooldown> $cooldowns */
            $cooldowns = $cooldownsByRequest->get($request->id, collect());

            return $this->analyzeRequest($request, $type, $cooldowns);
        });

        $blockingErrors = $analyses
            ->flatMap(fn (array $analysis): array => $analysis['errors'])
            ->values();

        return [
            'types' => $types,
            'types_to_repair' => $typesToRepair,
            'analyses' => $analyses,
            'requests_to_repair' => $analyses
                ->filter(fn (array $analysis): bool => $analysis['needs_repair'])
                ->values(),
            'blocking_errors' => $blockingErrors,
        ];
    }

    /**
     * @param  Collection<int, BeneficiaryCooldown>  $cooldowns
     * @return array<string, mixed>
     */
    private function analyzeRequest(
        AssistanceRequest $request,
        ?AssistanceType $type,
        Collection $cooldowns,
    ): array {
        $reference = $request->transaction_number ?: $request->id;
        $errors = [];
        $metadata = $request->metadata;

        if ($metadata !== null && ! is_array($metadata)) {
            $errors[] = "{$reference}: request metadata is not a valid object.";
        }

        $metadata = is_array($metadata) ? $metadata : [];
        $policy = $metadata['cooldown_policy'] ?? null;

        if ($policy !== null && ! is_array($policy)) {
            $errors[] = "{$reference}: cooldown_policy is not a valid object.";
        }

        $policy = is_array($policy) ? $policy : null;
        $requestHouseholdId = filled($request->household_id) ? (string) $request->household_id : null;

        if ($requestHouseholdId === null) {
            $errors[] = "{$reference}: the released request has no stored household.";
        }

        if ($type === null) {
            $errors[] = "{$reference}: assistance type {$request->assistance_type_id} could not be resolved.";
        } elseif ($type->municipal_id !== $request->municipal_id) {
            $errors[] = "{$reference}: the assistance type belongs to another municipality.";
        }

        $policyHouseholdId = filled($policy['household_id'] ?? null)
            ? (string) $policy['household_id']
            : null;
        if ($requestHouseholdId !== null
            && $policyHouseholdId !== null
            && $policyHouseholdId !== $requestHouseholdId) {
            $errors[] = "{$reference}: frozen cooldown household {$policyHouseholdId} conflicts with request household {$requestHouseholdId}.";
        }

        $missingHouseholdRowIds = [];
        foreach ($cooldowns as $cooldown) {
            if ($cooldown->assistance_type_id !== $request->assistance_type_id) {
                $errors[] = "{$reference}: cooldown {$cooldown->id} references another assistance type.";
            }

            if ($cooldown->household_id === null) {
                $missingHouseholdRowIds[] = $cooldown->id;
            } elseif ($requestHouseholdId !== null && $cooldown->household_id !== $requestHouseholdId) {
                $errors[] = "{$reference}: cooldown {$cooldown->id} belongs to household {$cooldown->household_id}.";
            }
        }

        $policyType = (string) ($policy['type'] ?? $type?->cooldown_type ?? 'per_request');
        $policyMonths = (int) ($policy['months'] ?? $type?->cooldown_months ?? 0);
        $requiresCooldownRow = $policyType === 'one_time' || $policyMonths > 0;

        if ($requiresCooldownRow && $cooldowns->isEmpty()) {
            $errors[] = "{$reference}: the released {$policyType} policy requires a cooldown row, but none exists.";
        }

        $previousScope = is_array($policy) && filled($policy['scope'] ?? null)
            ? (string) $policy['scope']
            : null;
        $policyNeedsRepair = $previousScope !== AssistanceCooldownScope::Household->value
            || $policyHouseholdId === null;
        $needsRepair = $errors === []
            && ($policyNeedsRepair || $missingHouseholdRowIds !== []);

        $result = match (true) {
            $errors !== [] => 'BLOCKED: '.implode(' ', array_map(
                fn (string $error): string => str($error)->after(': ')->toString(),
                $errors,
            )),
            ! $needsRepair => 'Already household-scoped',
            $policyNeedsRepair && $missingHouseholdRowIds !== [] => sprintf(
                'Repair policy and %d cooldown household link(s)',
                count($missingHouseholdRowIds),
            ),
            $policyNeedsRepair => 'Repair frozen policy',
            default => sprintf('Repair %d cooldown household link(s)', count($missingHouseholdRowIds)),
        };

        return [
            'request' => $request,
            'type' => $type,
            'cooldowns' => $cooldowns,
            'metadata' => $metadata,
            'policy' => $policy,
            'previous_scope' => $previousScope,
            'policy_needs_repair' => $policyNeedsRepair,
            'missing_household_row_ids' => $missingHouseholdRowIds,
            'needs_repair' => $needsRepair,
            'errors' => $errors,
            'result' => $result,
        ];
    }

    /** @param array<string, mixed> $state */
    private function renderAudit(array $state): void
    {
        $this->table(
            ['Assistance type', 'Active', 'Scope', 'Independent', 'Result'],
            $state['types']->filter(fn (AssistanceType $type): bool => $type->deleted_at === null)
                ->map(fn (AssistanceType $type): array => [
                    $type->name,
                    $type->is_active ? 'yes' : 'no',
                    $type->cooldown_scope,
                    $type->is_independent ? 'yes' : 'no',
                    $type->cooldown_scope === AssistanceCooldownScope::Household->value
                        && ! $type->is_independent
                        ? 'Already normalized'
                        : 'Set household scope',
                ])->values()->all(),
        );

        $this->table(
            ['Request', 'Program', 'Released', 'Rows', 'Frozen scope', 'Result'],
            $state['analyses']->map(function (array $analysis): array {
                /** @var AssistanceRequest $request */
                $request = $analysis['request'];
                /** @var AssistanceType|null $type */
                $type = $analysis['type'];

                return [
                    $request->transaction_number ?: $request->id,
                    $type?->name ?? $request->assistance_type_id,
                    $request->released_at?->toDateString() ?? 'missing',
                    $analysis['cooldowns']->count(),
                    $analysis['previous_scope'] ?? 'missing',
                    $analysis['result'],
                ];
            })->all(),
        );
    }

    /** @param Collection<int, AssistanceType> $types */
    private function repairAssistanceTypes(Collection $types): int
    {
        foreach ($types as $type) {
            $before = [
                'cooldown_scope' => $type->cooldown_scope,
                'is_independent' => $type->is_independent,
            ];
            $after = [
                'cooldown_scope' => AssistanceCooldownScope::Household->value,
                'is_independent' => false,
            ];

            $type->forceFill($after)->save();

            activity('assistance_type')
                ->withProperties([
                    'event' => 'household_cooldown_policy_normalized',
                    'source' => self::SOURCE,
                    'assistance_type_id' => $type->id,
                    'municipal_id' => $type->municipal_id,
                    'before' => $before,
                    'after' => $after,
                ])
                ->log('Normalized assistance type cooldown policy to household scope');
        }

        return $types->count();
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $analyses
     * @return array{requests: int, cooldown_rows: int}
     */
    private function repairReleasedRequests(Collection $analyses): array
    {
        $repairedRows = 0;
        $repairedAt = now()->toIso8601String();

        foreach ($analyses as $analysis) {
            /** @var AssistanceRequest $request */
            $request = $analysis['request'];
            /** @var Collection<int, BeneficiaryCooldown> $cooldowns */
            $cooldowns = $analysis['cooldowns'];
            $metadata = $analysis['metadata'];
            $policy = is_array($analysis['policy']) ? $analysis['policy'] : [];
            $beforeRows = $this->cooldownAuditValues($cooldowns);

            $policy['scope'] = AssistanceCooldownScope::Household->value;
            $policy['household_id'] = $request->household_id;
            $metadata['cooldown_policy'] = $policy;
            $metadata['cooldown_scope_repair'] = [
                'previous_scope' => $analysis['previous_scope'],
                'corrected_scope' => AssistanceCooldownScope::Household->value,
                'corrected_at' => $repairedAt,
                'source' => self::SOURCE,
            ];

            $updated = DB::table('ac_assistance_requests')
                ->where('id', $request->id)
                ->where('municipal_id', $request->municipal_id)
                ->where('status', AssistanceStatus::Released->value)
                ->update(['metadata' => json_encode($metadata, JSON_THROW_ON_ERROR)]);

            if ($updated !== 1) {
                throw new \DomainException(
                    "Released request {$request->transaction_number} changed during cooldown repair.",
                );
            }

            $missingHouseholdRowIds = $analysis['missing_household_row_ids'];
            if ($missingHouseholdRowIds !== []) {
                $rowUpdates = DB::table('ac_beneficiary_cooldowns')
                    ->whereIn('id', $missingHouseholdRowIds)
                    ->where('assistance_request_id', $request->id)
                    ->whereNull('household_id')
                    ->update(['household_id' => $request->household_id]);

                if ($rowUpdates !== count($missingHouseholdRowIds)) {
                    throw new \DomainException(
                        "Cooldown rows for {$request->transaction_number} changed during repair.",
                    );
                }

                $repairedRows += $rowUpdates;
            }

            $afterRows = $beforeRows;
            foreach ($afterRows as &$row) {
                if ($row['household_id'] === null) {
                    $row['household_id'] = $request->household_id;
                }
            }
            unset($row);

            activity('assistance_request')
                ->performedOn($request)
                ->withProperties([
                    'event' => 'released_cooldown_scope_repaired',
                    'source' => self::SOURCE,
                    'before' => [
                        'cooldown_policy' => $analysis['policy'],
                        'cooldown_rows' => $beforeRows,
                    ],
                    'after' => [
                        'cooldown_policy' => $policy,
                        'cooldown_rows' => $afterRows,
                    ],
                ])
                ->log('Corrected released assistance cooldown to household scope');
        }

        return [
            'requests' => $analyses->count(),
            'cooldown_rows' => $repairedRows,
        ];
    }

    /**
     * @param  Collection<int, BeneficiaryCooldown>  $cooldowns
     * @return list<array<string, mixed>>
     */
    private function cooldownAuditValues(Collection $cooldowns): array
    {
        return $cooldowns->map(fn (BeneficiaryCooldown $cooldown): array => [
            'id' => $cooldown->id,
            'beneficiary_id' => $cooldown->beneficiary_id,
            'assistance_type_id' => $cooldown->assistance_type_id,
            'household_member_id' => $cooldown->household_member_id,
            'household_id' => $cooldown->household_id,
            'cooldown_starts_at' => $cooldown->cooldown_starts_at?->toIso8601String(),
            'cooldown_expires_at' => $cooldown->cooldown_expires_at?->toIso8601String(),
        ])->values()->all();
    }

    private function resolveMunicipalId(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return Municipality::query()
            ->where(function ($query) use ($value): void {
                $query->whereKey($value)
                    ->orWhere('slug', $value)
                    ->orWhere('municipal_code', $value);
            })
            ->value('id');
    }
}
