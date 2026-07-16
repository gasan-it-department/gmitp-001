<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;

class EvaluateHouseholdHeadCandidateAction
{
    public function execute(HouseholdMember $member, Household $household): ?string
    {
        if (! $member->is_active) {
            return 'Member is not active in this household.';
        }

        if (! $member->is_verified_dependent) {
            return 'Household relationship is not verified.';
        }

        if ($member->birth_date === null || $member->birth_date->isAfter(now()->subYears(18))) {
            return 'Member must be at least 18 years old.';
        }

        $beneficiary = $member->relationLoaded('beneficiary')
            ? $member->beneficiary
            : $member->beneficiary()->first();

        if ($beneficiary === null) {
            return 'Member must be linked to a beneficiary profile.';
        }

        if ($beneficiary->municipal_id !== $household->municipal_id
            || $beneficiary->household_id !== $household->id) {
            return 'This must be the member\'s primary household.';
        }

        if (! $beneficiary->is_active || $beneficiary->merged_into_beneficiary_id !== null) {
            return 'Linked beneficiary profile is not active.';
        }

        if (! $beneficiary->isIdentityVerified()) {
            return 'Linked beneficiary identity is not verified.';
        }

        return null;
    }
}
