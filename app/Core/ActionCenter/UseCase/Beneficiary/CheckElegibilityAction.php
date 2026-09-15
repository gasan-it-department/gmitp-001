<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Dto\Beneficiary\EligibilityResult;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\BeneficiaryFlag;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\AssistanceCooldownService;
use Illuminate\Support\Collection;

/** Shared filing policy. Timed cooldowns are advisory; hard limits remain blocking. */
class CheckElegibilityAction
{
    private const IN_FLIGHT_STATUSES = ['pending', 'under_review', 'approved'];

    private readonly AssistanceCooldownService $cooldowns;

    public function __construct(
        private readonly ResolveBeneficiaryIdentityGroupAction $resolveGroup,
        ?AssistanceCooldownService $cooldowns = null,
    ) {
        $this->cooldowns = $cooldowns ?? new AssistanceCooldownService($resolveGroup);
    }

    public function execute(
        Beneficiary $beneficiary,
        AssistanceType $type,
        ?string $onBehalfHouseholdMemberId = null,
        ?string $onBehalfDateOfDeath = null,
        bool $allowPendingDependent = false,
    ): EligibilityResult {
        if (! $beneficiary->is_active) {
            return EligibilityResult::beneficiaryInactive();
        }

        if ($beneficiary->isIntakeRejected()) {
            return EligibilityResult::intakeRejected();
        }

        if (! $beneficiary->isIdentityVerified()) {
            return EligibilityResult::identityUnverified();
        }

        if (! $beneficiary->household?->isVerified()) {
            return EligibilityResult::householdHeadRequired();
        }

        $member = null;
        if ($onBehalfHouseholdMemberId !== null) {
            $member = HouseholdMember::query()
                ->whereKey($onBehalfHouseholdMemberId)
                ->where('household_id', $beneficiary->household_id)
                ->where('is_active', true)
                ->first();

            if ($member !== null
                && $member->relationship !== 'head'
                && ! $member->is_verified_dependent
                && ! $allowPendingDependent) {
                return EligibilityResult::dependentUnverified();
            }
        }

        $group = $this->resolveGroup->execute($beneficiary);
        if ($this->hasActiveBlacklistFlag($group)) {
            return EligibilityResult::blocked();
        }

        $cooldown = $this->cooldowns->evaluate(
            $beneficiary,
            $type,
            $member,
            resolvedGroup: $group,
        );
        if ($cooldown->hasPermanentBlock) {
            return EligibilityResult::permanentBlock();
        }

        if (($member !== null && $this->hasAnyInFlightRequestForRecipient($member->id))
            || $this->hasAnyInFlightRequest($group)) {
            return EligibilityResult::inFlightRequest();
        }

        if ($cooldown->advisory->isActive() && $cooldown->advisory->effectiveExpiresAt !== null) {
            return EligibilityResult::onCooldown(
                $cooldown->advisory->effectiveExpiresAt,
                $cooldown->advisory,
            );
        }

        return EligibilityResult::eligible();
    }

    /**
     * @param  Collection<int, AssistanceType>  $types
     * @return array<string, EligibilityResult>
     */
    public function executeBatch(Beneficiary $beneficiary, Collection $types): array
    {
        return $types
            ->mapWithKeys(fn (AssistanceType $type): array => [
                $type->id => $this->execute($beneficiary, $type),
            ])
            ->all();
    }

    private function hasActiveBlacklistFlag(BeneficiaryIdentityGroup $group): bool
    {
        return BeneficiaryFlag::query()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->where('severity', BeneficiaryFlag::SEVERITY_BLACKLIST)
            ->active()
            ->exists();
    }

    private function hasAnyInFlightRequest(BeneficiaryIdentityGroup $group): bool
    {
        return AssistanceRequest::query()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->whereIn('status', self::IN_FLIGHT_STATUSES)
            ->exists();
    }

    private function hasAnyInFlightRequestForRecipient(string $memberId): bool
    {
        return AssistanceRequest::query()
            ->where('on_behalf_household_member_id', $memberId)
            ->whereIn('status', self::IN_FLIGHT_STATUSES)
            ->exists();
    }
}
