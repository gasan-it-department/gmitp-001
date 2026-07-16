<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * "Link, don't duplicate": point an existing roster row at an already-registered
 * beneficiary (identity reconciliation) WITHOUT disturbing that person's own
 * home household.
 *
 * When the admin recognises that a household member is already in the registry,
 * this stamps the member row's beneficiary_id with the existing beneficiary —
 * the row becomes a descriptive "also lives in this family" reference. Crucially
 * it does NOT change the target beneficiary's household_id: one person keeps one
 * primary household (ac_household_members.beneficiary_id is intentionally NOT
 * unique, so the same person can be referenced by their own Head row and a
 * roster row in another family).
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
    public function execute(
        string $memberId,
        string $beneficiaryNumber,
        string $municipalId,
        string $actingAdminId,
    ): HouseholdMember {
        return DB::transaction(function () use ($memberId, $beneficiaryNumber, $municipalId, $actingAdminId) {
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

            $target = Beneficiary::query()
                ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId))
                ->where('beneficiary_number', mb_strtoupper(trim($beneficiaryNumber)))
                ->first();

            if (! $target) {
                throw new \DomainException(
                    'No beneficiary with that number exists in this municipality. Check the number (e.g. GAS-000123) and try again.',
                );
            }

            // Stamp the link. We deliberately do NOT touch $target->household_id —
            // the target keeps their own primary household.
            $member->update([
                'beneficiary_id' => $target->id,
                'is_verified_dependent' => false,
            ]);

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
