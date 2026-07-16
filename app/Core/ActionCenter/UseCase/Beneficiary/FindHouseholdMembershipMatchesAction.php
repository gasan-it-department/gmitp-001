<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Support\Collection;

class FindHouseholdMembershipMatchesAction
{
    /** @return Collection<int, HouseholdMember> */
    public function execute(Beneficiary $beneficiary): Collection
    {
        return HouseholdMember::query()
            ->with(['household.activeHead.beneficiary'])
            ->whereHas('household', fn ($query) => $query
                ->where('municipal_id', $beneficiary->municipal_id)
                ->whereKeyNot($beneficiary->household_id))
            ->whereHas('household.activeHead.beneficiary', fn ($query) => $query
                ->whereNotNull('identity_verified_at'))
            ->where('is_active', true)
            ->whereNull('beneficiary_id')
            ->where('first_name', $beneficiary->first_name)
            ->where('last_name', $beneficiary->last_name)
            ->whereDate('birth_date', $beneficiary->birth_date)
            ->orderBy('created_at')
            ->get();
    }
}
