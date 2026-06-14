<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class UnlinkHouseholdMemberBeneficiaryAction
{
    public function execute(
        string $memberId,
        string $reason,
        string $municipalId,
        string $actingAdminId,
    ): HouseholdMember {
        return DB::transaction(function () use ($memberId, $reason, $municipalId, $actingAdminId) {
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
                    'The active household head cannot be unlinked. Use the household reassignment workflow instead.',
                );
            }

            if ($member->beneficiary_id === null) {
                throw new \DomainException('This household member is not linked to a beneficiary profile.');
            }

            $beneficiary = Beneficiary::withTrashed()
                ->whereKey($member->beneficiary_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($beneficiary->municipal_id !== $municipalId) {
                throw new AuthorizationException(
                    'The linked beneficiary belongs to another municipality.',
                );
            }

            if ($beneficiary->household_id === $member->household_id) {
                throw new \DomainException(
                    'This is the beneficiary\'s primary household membership. Use Correct Household Assignment or Transfer Household instead.',
                );
            }

            if (AssistanceRequest::withTrashed()
                ->where('on_behalf_household_member_id', $member->id)
                ->exists()) {
                throw new \DomainException(
                    'This link is referenced by an assistance request and cannot be removed.',
                );
            }

            $linkedBeneficiaryId = $member->beneficiary_id;
            $member->update(['beneficiary_id' => null]);

            activity('household-member-unlink')
                ->performedOn($member)
                ->causedBy(User::find($actingAdminId))
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'household_id' => $member->household_id,
                    'household_member_id' => $member->id,
                    'unlinked_beneficiary_id' => $linkedBeneficiaryId,
                    'reason' => trim($reason),
                ])
                ->log('Unlinked a beneficiary profile from a household member');

            return $member->fresh();
        }, attempts: 3);
    }
}
