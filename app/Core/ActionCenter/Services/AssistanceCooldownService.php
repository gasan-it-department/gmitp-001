<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Dto\Beneficiary\AssistanceCooldownEvaluation;
use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Dto\Beneficiary\CooldownAdvisory;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveBeneficiaryIdentityGroupAction;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final class AssistanceCooldownService
{
    public function __construct(
        private readonly ResolveBeneficiaryIdentityGroupAction $resolveIdentityGroup,
    ) {}

    public function evaluate(
        Beneficiary $beneficiary,
        AssistanceType $requestedType,
        ?HouseholdMember $assistedPerson = null,
        ?CarbonImmutable $asOf = null,
        ?string $excludeRequestId = null,
        ?BeneficiaryIdentityGroup $resolvedGroup = null,
    ): AssistanceCooldownEvaluation {
        $asOf ??= CarbonImmutable::now();
        $group = $resolvedGroup ?? $this->resolveIdentityGroup->execute($beneficiary);
        $identityIds = $this->identityIds($group, $assistedPerson);
        $currentHouseholdId = $group->canonical->household_id;
        $matched = $this->matchedRows($identityIds, $currentHouseholdId, $asOf, $excludeRequestId);

        $hasPermanentBlock = $matched->contains(
            fn (BeneficiaryCooldown $row): bool => $row->assistance_type_id === $requestedType->id
                && $row->cooldown_expires_at === null,
        );

        return new AssistanceCooldownEvaluation(
            hasPermanentBlock: $hasPermanentBlock,
            advisory: $this->timedAdvisory($matched, $identityIds, $currentHouseholdId, $asOf),
        );
    }

    public function advisoryFor(
        Beneficiary $beneficiary,
        ?HouseholdMember $assistedPerson = null,
        ?CarbonImmutable $asOf = null,
        ?string $excludeRequestId = null,
        ?BeneficiaryIdentityGroup $resolvedGroup = null,
    ): CooldownAdvisory {
        $asOf ??= CarbonImmutable::now();
        $group = $resolvedGroup ?? $this->resolveIdentityGroup->execute($beneficiary);
        $identityIds = $this->identityIds($group, $assistedPerson);
        $currentHouseholdId = $group->canonical->household_id;
        $matched = $this->matchedRows($identityIds, $currentHouseholdId, $asOf, $excludeRequestId);

        return $this->timedAdvisory($matched, $identityIds, $currentHouseholdId, $asOf);
    }

    /**
     * @param  list<string>  $identityIds
     * @return Collection<int, BeneficiaryCooldown>
     */
    private function matchedRows(
        array $identityIds,
        ?string $currentHouseholdId,
        CarbonImmutable $asOf,
        ?string $excludeRequestId,
    ): Collection {
        return BeneficiaryCooldown::query()
            ->with(['assistanceRequest.assistanceType'])
            ->whereHas('assistanceRequest', function (Builder $query) use ($asOf, $excludeRequestId): void {
                $query->whereNotNull('released_at')
                    ->where('released_at', '<=', $asOf);

                if ($excludeRequestId !== null) {
                    $query->where('id', '!=', $excludeRequestId);
                }
            })
            ->where(function (Builder $query) use ($identityIds, $currentHouseholdId): void {
                $query->whereIn('beneficiary_id', $identityIds);

                if ($currentHouseholdId !== null) {
                    $query->orWhere('household_id', $currentHouseholdId);
                }
            })
            ->get()
            ->filter(function (BeneficiaryCooldown $row) use ($identityIds, $currentHouseholdId): bool {
                $scope = $this->sourceScope($row);
                $personal = in_array($row->beneficiary_id, $identityIds, true);
                $household = $scope === 'per_household'
                    && $currentHouseholdId !== null
                    && $row->household_id === $currentHouseholdId;

                return $personal || $household;
            });
    }

    /**
     * @param  Collection<int, BeneficiaryCooldown>  $matched
     * @param  list<string>  $identityIds
     */
    private function timedAdvisory(
        Collection $matched,
        array $identityIds,
        ?string $currentHouseholdId,
        CarbonImmutable $asOf,
    ): CooldownAdvisory {
        $activeTimedRows = $matched->filter(
            fn (BeneficiaryCooldown $row): bool => $row->cooldown_expires_at !== null
                && CarbonImmutable::instance($row->cooldown_starts_at)->lessThanOrEqualTo($asOf)
                && CarbonImmutable::instance($row->cooldown_expires_at)->greaterThan($asOf),
        );

        $sources = $this->groupSources($activeTimedRows, $identityIds, $currentHouseholdId);
        $effectiveExpiry = collect($sources)
            ->pluck('cooldown_expires_at')
            ->filter()
            ->map(fn (string $value): CarbonImmutable => CarbonImmutable::parse($value))
            ->sortDesc()
            ->first();

        return new CooldownAdvisory(
            sources: $sources,
            effectiveExpiresAt: $effectiveExpiry,
            contextFingerprint: $this->fingerprint($asOf, $sources),
        );
    }

    /** @param list<array<string, mixed>> $reviewedSources */
    public function authorizationCovers(CooldownAdvisory $current, array $reviewedSources): bool
    {
        $authorized = collect($reviewedSources)
            ->pluck('source_fingerprint')
            ->filter()
            ->all();

        return collect($current->sources)->every(
            fn (array $source): bool => in_array($source['source_fingerprint'], $authorized, true),
        );
    }

    /** @return list<string> */
    private function identityIds(BeneficiaryIdentityGroup $group, ?HouseholdMember $assistedPerson): array
    {
        $ids = $group->beneficiaryIds;

        if ($assistedPerson?->beneficiary_id !== null) {
            $assistedBeneficiary = Beneficiary::query()->find($assistedPerson->beneficiary_id);
            if ($assistedBeneficiary !== null) {
                $ids = array_merge($ids, $this->resolveIdentityGroup->execute($assistedBeneficiary)->beneficiaryIds);
            }
        }

        return array_values(array_unique($ids));
    }

    private function sourceScope(BeneficiaryCooldown $row): string
    {
        return (string) (data_get($row->assistanceRequest?->metadata, 'cooldown_policy.scope')
            ?? $row->assistanceRequest?->assistanceType?->cooldown_scope
            ?? 'per_beneficiary');
    }

    /**
     * @param  Collection<int, BeneficiaryCooldown>  $rows
     * @param  list<string>  $identityIds
     * @return list<array<string, mixed>>
     */
    private function groupSources(Collection $rows, array $identityIds, ?string $currentHouseholdId): array
    {
        return $rows
            ->groupBy('assistance_request_id')
            ->map(function (Collection $requestRows) use ($identityIds, $currentHouseholdId): array {
                /** @var BeneficiaryCooldown $first */
                $first = $requestRows->first();
                $request = $first->assistanceRequest;
                $scope = $this->sourceScope($first);
                $hasPersonalMatch = $requestRows->contains(
                    fn (BeneficiaryCooldown $row): bool => in_array($row->beneficiary_id, $identityIds, true),
                );
                $hasHouseholdMatch = $scope === 'per_household'
                    && $currentHouseholdId !== null
                    && $requestRows->contains(fn (BeneficiaryCooldown $row): bool => $row->household_id === $currentHouseholdId);
                /** @var BeneficiaryCooldown|null $latest */
                $latest = $requestRows
                    ->sortByDesc(fn (BeneficiaryCooldown $row) => $row->cooldown_expires_at?->getTimestamp() ?? 0)
                    ->first();
                $expiry = $latest?->cooldown_expires_at;

                $source = [
                    'request_id' => $request?->id ?? $first->assistance_request_id,
                    'transaction_number' => $request?->transaction_number,
                    'assistance_type_id' => $first->assistance_type_id,
                    'program' => $request?->assistanceType?->name,
                    'amount' => $request?->amount_approved !== null ? (float) $request->amount_approved : null,
                    'release_date' => $request?->released_at?->toDateString(),
                    'cooldown_starts_at' => $first->cooldown_starts_at?->toIso8601String(),
                    'cooldown_expires_at' => $expiry?->toIso8601String(),
                    'match_type' => $hasPersonalMatch && $hasHouseholdMatch
                        ? 'personal_and_household'
                        : ($hasPersonalMatch ? 'personal' : 'household'),
                    'scope' => $scope,
                ];
                $source['source_fingerprint'] = hash('sha256', json_encode($source, JSON_THROW_ON_ERROR));

                return $source;
            })
            ->sortBy('request_id')
            ->values()
            ->all();
    }

    /** @param list<array<string, mixed>> $sources */
    private function fingerprint(CarbonImmutable $asOf, array $sources): string
    {
        return hash('sha256', json_encode([
            'as_of' => $asOf->toDateString(),
            'sources' => collect($sources)->pluck('source_fingerprint')->sort()->values()->all(),
        ], JSON_THROW_ON_ERROR));
    }
}
