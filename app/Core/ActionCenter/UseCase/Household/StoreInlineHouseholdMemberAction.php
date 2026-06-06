<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\CreateInlineHouseholdMemberDto;
use App\Core\ActionCenter\Models\HouseholdMember;

/**
 * Creates a new ac_household_members row inline from the Apply form, so a
 * citizen can name a family member who isn't yet on their household roster
 * and immediately file an on-behalf request linked to that member.
 *
 * The new row is inactive-ready: beneficiary_id is NULL (this person has no
 * portal account), and the admin can later link the row to a beneficiary
 * during their interview.
 */
class StoreInlineHouseholdMemberAction
{
    public function execute(CreateInlineHouseholdMemberDto $dto): HouseholdMember
    {
        return HouseholdMember::create([
            'household_id' => $dto->householdId,
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'middle_name' => $dto->middleName,
            'suffix' => $dto->suffix,
            'relationship' => $dto->relationship,
            'birth_date' => $dto->birthDate,
            'sex' => $dto->sex,
            'is_active' => true,
        ]);
    }
}
