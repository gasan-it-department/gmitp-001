<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\CooldownScope;
use App\Core\GoodsDistribution\Enums\CooldownUnit;
use App\Core\GoodsDistribution\Models\DistributionCooldown;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Program;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

final class DistributionCooldownService
{
    public function __construct(private readonly GoodsRecipientIdentityService $identities, private readonly DistributionRequestService $requests) {}

    public function policy(array $data): array
    {
        $enabled = (bool) ($data['cooldown_enabled'] ?? false);
        $scope = CooldownScope::tryFrom($data['cooldown_scope'] ?? 'household');
        $unit = CooldownUnit::tryFrom($data['cooldown_unit'] ?? '');
        $duration = filter_var($data['cooldown_duration'] ?? null, FILTER_VALIDATE_INT);
        if (! $scope || ($enabled && (! $unit || $duration === false || $duration < 1 || $duration > 3650))) {
            throw new \DomainException('Choose a valid cooldown scope, unit, and duration between 1 and 3650.');
        }

        return ['enabled' => $enabled, 'scope' => $scope->value, 'duration' => $enabled ? $duration : null, 'unit' => $enabled ? $unit->value : null];
    }

    public function endDate(string $date, array $policy): ?string
    {
        if (! $policy['enabled']) {
            return null;
        }
        $start = CarbonImmutable::parse($date, config('app.timezone'))->startOfDay();

        return (match (CooldownUnit::from($policy['unit'])) {
            CooldownUnit::Days => $start->addDays($policy['duration']),
            CooldownUnit::Weeks => $start->addWeeks($policy['duration']),
            CooldownUnit::Months => $start->addMonthsNoOverflow($policy['duration']),
        })->toDateString();
    }

    public function context(DistributionRequest $request, string $date): array
    {
        $context = $this->evaluate($request->municipal_id, $request->program_id, $request->reviewed_snapshot, $date, $request->id);
        $revision = $request->approval_revision + ($request->status->value === 'under_review' ? 1 : 0);
        $context['fingerprint'] = $this->requests->hash([$context['fingerprint'], $request->id, $revision, $request->reviewed_snapshot['identity_fingerprint']]);
        $context['authorization_current'] = ! $context['blocked'] || $this->covers($request, $context);

        return $context;
    }

    public function evaluate(string $municipalId, string $programId, array $snapshot, string $date, ?string $excludeRequestId = null): array
    {
        if (! Schema::hasTable('gd_distribution_cooldowns') || ! Schema::hasColumn('gd_distribution_requests', 'cooldown_exception_authorization')) {
            throw new \DomainException('Apply the pending Goods Distribution database updates before checking cooldown eligibility.');
        }
        $program = Program::query()->where('municipal_id', $municipalId)->whereKey($programId)->firstOrFail();
        $policy = $this->policy($program->only(['cooldown_enabled', 'cooldown_scope', 'cooldown_duration', 'cooldown_unit']));
        $endsOn = $this->endDate($date, $policy);
        $subject = $this->subjectMember($snapshot);
        $identity = $this->targetIdentity($municipalId, $subject);
        $conflicts = DistributionCooldown::query()->where('municipal_id', $municipalId)->where('program_id', $programId)
            ->whereHas('request', fn ($q) => $q->where('status', 'released')->where('municipal_id', $municipalId)
                ->whereColumn('gd_distribution_requests.program_id', 'gd_distribution_cooldowns.program_id'))
            ->where('starts_on', '<=', $date)->where('ends_on', '>', $date)
            ->when($excludeRequestId, fn ($q) => $q->where('distribution_request_id', '!=', $excludeRequestId))
            ->where(fn ($q) => $this->matching($q, $identity, $snapshot['household_id']))->with('request')->get()
            ->groupBy('distribution_request_id')->map(fn ($rows) => [
                'request_id' => $rows->first()->distribution_request_id, 'reference' => $rows->first()->request->reference,
                'kind' => 'active', 'scope' => $rows->first()->scope, 'starts_on' => $rows->first()->starts_on->toDateString(),
                'ends_on' => $rows->max(fn ($row) => $row->ends_on->toDateString()),
            ])->values()->all();

        // Late posting must also review any later tracked handover the new interval would cover.
        if ($endsOn !== null) {
            $targets = $policy['scope'] === 'household' ? $this->cohortIdentity($municipalId, $snapshot['roster']) : $identity;
            $later = DistributionRequest::query()->where('municipal_id', $municipalId)->where('program_id', $programId)
                ->where('status', 'released')->whereNotNull('cooldown_policy')
                ->where('actual_release_on', '>', $date)->where('actual_release_on', '<', $endsOn)
                ->when($excludeRequestId, fn ($q) => $q->where('id', '!=', $excludeRequestId))->get();
            foreach ($later as $record) {
                $saved = $record->handover_snapshot ?? $record->reviewed_snapshot;
                $member = $this->subjectMember($saved);
                if (($policy['scope'] === 'household' && $saved['household_id'] === $snapshot['household_id'])
                    || $this->memberMatches($member, $targets)) {
                    $conflicts[] = ['request_id' => $record->id, 'reference' => $record->reference, 'kind' => 'historical_overlap',
                        'scope' => $policy['scope'], 'starts_on' => $record->actual_release_on->toDateString(), 'ends_on' => $endsOn];
                }
            }
        }
        $conflicts = collect($conflicts)->unique('request_id')->sortBy('request_id')->values()->all();
        $result = ['date' => $date, 'policy' => [...$policy, 'starts_on' => $date, 'ends_on' => $endsOn],
            'blocked' => count($conflicts) > 0, 'conflicts' => $conflicts, 'next_eligible_on' => collect($conflicts)->max('ends_on')];
        $result['fingerprint'] = $this->requests->hash([$programId, $snapshot['identity_fingerprint'], $result]);

        return $result;
    }

    public function authorize(DistributionRequest $request, array $context, string $fingerprint, string $reason, string $actorId): ?array
    {
        if ($fingerprint === '' && ! $context['blocked'] && ! $context['policy']['enabled']) {
            return null;
        }
        if (! hash_equals($context['fingerprint'], $fingerprint)) {
            throw new \DomainException('Cooldown context changed. Refresh and review the current eligibility before proceeding.');
        }
        if (! $context['blocked']) {
            return null;
        }
        $reason = trim($reason);
        if (mb_strlen($reason) < 10 || mb_strlen($reason) > 1000) {
            throw new \DomainException('Provide a cooldown exception reason of 10 to 1000 characters.');
        }

        return ['fingerprint' => $context['fingerprint'], 'date' => $context['date'],
            'approval_revision' => $request->approval_revision + ($request->status->value === 'under_review' ? 1 : 0),
            'reason' => $reason, 'actor_user_id' => $actorId, 'authorized_at' => now()->toIso8601String(),
            'sources' => $context['conflicts']];
    }

    public function covers(DistributionRequest $request, array $context): bool
    {
        $authorization = $request->cooldown_exception_authorization;

        return is_array($authorization) && ($authorization['approval_revision'] ?? null) === $request->approval_revision
            && ($authorization['date'] ?? null) === $context['date']
            && hash_equals($context['fingerprint'], $authorization['fingerprint'] ?? '');
    }

    public function capture(DistributionRequest $request, array $context): array
    {
        $policy = [...$context['policy'], 'exception_used' => $context['blocked'], 'captured_at' => now()->toIso8601String()];
        if ($policy['enabled']) {
            $members = $policy['scope'] === 'household' ? $request->reviewed_snapshot['roster'] : [$this->subjectMember($request->reviewed_snapshot)];
            foreach ($members as $member) {
                DistributionCooldown::create(['municipal_id' => $request->municipal_id, 'program_id' => $request->program_id,
                    'distribution_request_id' => $request->id, 'household_id' => $request->household_id,
                    'household_member_id' => $member['id'], 'beneficiary_id' => $member['beneficiary_id'] ?? null,
                    'scope' => $policy['scope'], 'duration' => $policy['duration'], 'unit' => $policy['unit'],
                    'starts_on' => $policy['starts_on'], 'ends_on' => $policy['ends_on'], 'created_at' => now()]);
            }
        }

        return $policy;
    }

    public function profile(string $municipalId, array $identity): array
    {
        $date = today()->toDateString();

        return DistributionCooldown::query()->where('municipal_id', $municipalId)->where('starts_on', '<=', $date)->where('ends_on', '>', $date)
            ->whereHas('request', fn ($q) => $q->where('status', 'released')->where('municipal_id', $municipalId)
                ->whereColumn('gd_distribution_requests.program_id', 'gd_distribution_cooldowns.program_id'))
            ->where(fn ($q) => $this->matching($q, $identity, $identity['household_id'] ?? null))->with('request')->get()
            ->groupBy('program_id')->map(fn ($rows, $programId) => ['program_id' => $programId,
                'program_name' => $rows->first()->request->program_name_snapshot,
                'next_eligible_on' => $rows->max(fn ($row) => $row->ends_on->toDateString()),
                'sources' => $rows->unique('distribution_request_id')->map(fn ($row) => ['request_id' => $row->distribution_request_id,
                    'reference' => $row->request->reference, 'scope' => $row->scope])->values()->all()])->values()->all();
    }

    private function subjectMember(array $snapshot): array
    {
        $subject = $snapshot['subject'];
        $members = collect($snapshot['roster']);
        $matches = ($subject['id'] ?? null) === ($snapshot['filer']['id'] ?? null)
            ? $members->where('beneficiary_id', $snapshot['filer']['beneficiary_id'])
            : $members->where('id', $subject['id']);
        if ($matches->count() !== 1) {
            throw new \DomainException('Resolve the intended recipient household identity before evaluating goods cooldowns.');
        }

        return $matches->first();
    }

    private function targetIdentity(string $municipalId, array $member): array
    {
        return $this->identities->resolve($municipalId, isset($member['beneficiary_id']) ? 'beneficiary' : 'member', $member['beneficiary_id'] ?? $member['id']);
    }

    private function cohortIdentity(string $municipalId, array $members): array
    {
        $targets = ['beneficiary_ids' => [], 'member_ids' => array_column($members, 'id')];
        foreach ($members as $member) {
            $identity = $this->targetIdentity($municipalId, $member);
            $targets['beneficiary_ids'] = array_merge($targets['beneficiary_ids'], $identity['beneficiary_ids']);
            $targets['member_ids'] = array_merge($targets['member_ids'], $identity['member_ids']);
        }

        return $targets;
    }

    private function matching(Builder $query, array $identity, ?string $householdId): void
    {
        $query->whereIn('beneficiary_id', $identity['beneficiary_ids'])
            ->orWhere(fn ($q) => $q->whereNull('beneficiary_id')->whereIn('household_member_id', $identity['member_ids']));
        if ($householdId !== null) {
            $query->orWhere(fn ($q) => $q->where('scope', 'household')->where('household_id', $householdId));
        }
    }

    private function memberMatches(array $member, array $identity): bool
    {
        return isset($member['beneficiary_id']) ? in_array($member['beneficiary_id'], $identity['beneficiary_ids'], true)
            : in_array($member['id'], $identity['member_ids'], true);
    }
}
