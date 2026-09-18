<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberIdentityMatcher;
use App\Core\ActionCenter\Services\LinkedHouseholdMemberProfileSynchronizer;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * "Link, don't duplicate": point an existing roster row at an already-registered
 * beneficiary (identity reconciliation) WITHOUT disturbing that person's own
 * home household.
 *
 * When the admin recognises that a household member is already in the registry,
 * this stamps the member row's beneficiary_id with the existing beneficiary and
 * replaces its shared personal fields with the beneficiary profile values. The
 * target must already belong to this same primary household and may have only
 * one active linked roster row.
 *
 * The target is resolved by its human-friendly beneficiary_number (e.g.
 * GAS-000123), mirroring how LinkBeneficiaryToUserAction resolves an account by
 * email, and scoped to the acting municipality so an admin can never reach
 * across tenants.
 *
 * Guards (cheap → expensive):
 *   1. Tenant       — the member's household belongs to this municipality
 *   2. Not the head — the head row already IS the beneficiary (can't relink)
 *   3. Not linked   — the row isn't already reconciled to someone
 *   4. Target found — a beneficiary with that number exists in this tenant
 *
 * `beneficiary_id` is in HouseholdMember's LogsActivity set, so the link is
 * audited automatically; an explicit entry records the acting admin + target.
 */
class LinkHouseholdMemberToBeneficiaryAction
{
    public function __construct(
        private readonly HouseholdMemberIdentityMatcher $identityMatcher,
        private readonly LinkedHouseholdMemberProfileSynchronizer $profileSynchronizer,
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
    ) {}

    public function execute(
        string $memberId,
        string $beneficiaryNumber,
        string $municipalId,
        string $actingAdminId,
    ): HouseholdMember {
        return DB::transaction(function () use ($memberId, $beneficiaryNumber, $municipalId, $actingAdminId) {
            $this->lockMunicipality->execute($municipalId);
            $member = HouseholdMember::query()
                ->with('household')
                ->whereKey($memberId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($member->household?->municipal_id !== $municipalId) {
                throw new AuthorizationException(
                    'You may only manage household members from your own municipality.',
                );
            }

            if ($member->relationship === Relationship::Head->value) {
                throw new \DomainException(
                    'The head of the household is already the beneficiary — there is nothing to link.',
                );
            }

            if ($member->beneficiary_id !== null) {
                throw new \DomainException(
                    'This member is already linked to a beneficiary record.',
                );
            }

            if (! $member->is_active) {
                throw new \DomainException('Move the roster member back in before linking a beneficiary profile.');
            }

            $target = Beneficiary::query()
                ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId))
                ->where('beneficiary_number', mb_strtoupper(trim($beneficiaryNumber)))
                ->lockForUpdate()
                ->first();

            if (! $target) {
                throw new \DomainException(
                    'No beneficiary with that number exists in this municipality. Check the number (e.g. GAS-000123) and try again.',
                );
            }

            if (! $target->is_active) {
                throw new \DomainException('The beneficiary profile is inactive. Restore or transfer it before linking.');
            }

            if ($target->household_id !== $member->household_id) {
                throw new \DomainException(
                    'This beneficiary belongs to another primary household. Use Transfer/Reassign Household instead of linking.',
                );
            }

            $this->identityMatcher->assertMatches($member, $target);

            if (HouseholdMember::query()
                ->where('beneficiary_id', $target->id)
                ->where('is_active', true)
                ->whereKeyNot($member->id)
                ->exists()) {
                throw new \DomainException(
                    'This beneficiary already has an active household membership. Use Transfer/Reassign Household if residence changed.',
                );
            }

            $member->update([
                'beneficiary_id' => $target->id,
                'is_verified_dependent' => false,
            ]);
            $this->profileSynchronizer->sync($member, $target);

            activity('household-member-link')
                ->performedOn($member)
                ->causedBy(User::find($actingAdminId))
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'household_member_id' => $member->id,
                    'household_id' => $member->household_id,
                    'linked_beneficiary_id' => $target->id,
                    'beneficiary_number' => $target->beneficiary_number,
                ])
                ->log('Linked a household member to an existing beneficiary');

            return $member->fresh();
        }, attempts: 3);
    }
}
