<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;

final class LinkedHouseholdMemberProfileSynchronizer
{
    /** @return array<string, string|float|null> */
    public function profileAttributes(Beneficiary $beneficiary): array
    {
        return [
            'first_name' => $beneficiary->first_name,
            'middle_name' => $beneficiary->middle_name,
            'last_name' => $beneficiary->last_name,
            'suffix' => $beneficiary->suffix,
            'birth_date' => $beneficiary->birth_date?->toDateString(),
            'sex' => $beneficiary->getRawOriginal('sex'),
            'civil_status' => $beneficiary->getRawOriginal('civil_status'),
            'educational_attainment' => $beneficiary->getRawOriginal('educational_attainment'),
            'occupation' => $beneficiary->occupation,
            'monthly_income' => (float) ($beneficiary->monthly_income ?? 0),
            'religion_id' => $beneficiary->religion_id,
        ];
    }

    public function sync(HouseholdMember $member, Beneficiary $beneficiary): void
    {
        if ($member->beneficiary_id !== null && $member->beneficiary_id !== $beneficiary->id) {
            throw new \DomainException('The household member is linked to a different beneficiary profile.');
        }

        $member->update($this->profileAttributes($beneficiary));
    }

    /** @return array<string, array{member: mixed, beneficiary: mixed}> */
    public function differences(HouseholdMember $member, Beneficiary $beneficiary): array
    {
        $profile = $this->profileAttributes($beneficiary);
        $memberValues = [
            'first_name' => $member->first_name,
            'middle_name' => $member->middle_name,
            'last_name' => $member->last_name,
            'suffix' => $member->suffix,
            'birth_date' => $member->birth_date?->toDateString(),
            'sex' => $member->getRawOriginal('sex'),
            'civil_status' => $member->getRawOriginal('civil_status'),
            'educational_attainment' => $member->getRawOriginal('educational_attainment'),
            'occupation' => $member->occupation,
            'monthly_income' => (float) ($member->monthly_income ?? 0),
            'religion_id' => $member->religion_id,
        ];

        $differences = [];
        foreach ($profile as $field => $profileValue) {
            if ($memberValues[$field] === $profileValue) {
                continue;
            }

            $differences[$field] = [
                'member' => $memberValues[$field],
                'beneficiary' => $profileValue,
            ];
        }

        return $differences;
    }
}
