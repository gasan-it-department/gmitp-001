<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Models\HouseholdMember;
use Carbon\CarbonInterface;

/**
 * Frozen, document-safe representation of one household roster row.
 */
readonly class AssistanceRequestHouseholdMemberData
{
    public function __construct(
        public ?string $householdMemberId,
        public ?string $beneficiaryId,
        public string $fullName,
        public ?string $relationship,
        public ?string $birthDate,
        public ?int $ageAtFiling,
        public ?string $sex,
        public ?string $educationalAttainment,
        public ?string $occupation,
        public ?float $monthlyIncome,
        public bool $isHouseholdHead,
    ) {}

    public static function fromModel(
        HouseholdMember $member,
        CarbonInterface $capturedAt,
    ): self {
        $relationship = $member->getRawOriginal('relationship');

        return new self(
            householdMemberId: (string) $member->id,
            beneficiaryId: $member->beneficiary_id
                ? (string) $member->beneficiary_id
                : null,
            fullName: trim(implode(' ', array_filter([
                $member->first_name,
                $member->middle_name,
                $member->last_name,
                $member->suffix,
            ]))),
            relationship: is_string($relationship) && $relationship !== ''
                ? $relationship
                : null,
            birthDate: $member->birth_date?->toDateString(),
            ageAtFiling: $member->birth_date
                ? (int) $member->birth_date->diffInYears($capturedAt)
                : null,
            sex: $member->getRawOriginal('sex') ?: null,
            educationalAttainment: $member->getRawOriginal('educational_attainment') ?: null,
            occupation: filled($member->occupation)
                ? trim((string) $member->occupation)
                : null,
            monthlyIncome: $member->monthly_income === null
                ? null
                : (float) $member->monthly_income,
            isHouseholdHead: $relationship === 'head',
        );
    }

    /** @param array<string, mixed> $values */
    public static function fromSnapshot(array $values): self
    {
        $relationship = filled($values['relationship'] ?? null)
            ? (string) $values['relationship']
            : null;
        $monthlyIncome = $values['monthly_income'] ?? null;
        $ageAtFiling = $values['age_at_filing'] ?? null;

        return new self(
            householdMemberId: filled($values['household_member_id'] ?? null)
                ? (string) $values['household_member_id']
                : null,
            beneficiaryId: filled($values['beneficiary_id'] ?? null)
                ? (string) $values['beneficiary_id']
                : null,
            fullName: trim((string) ($values['full_name'] ?? '')),
            relationship: $relationship,
            birthDate: filled($values['birth_date'] ?? null)
                ? (string) $values['birth_date']
                : null,
            ageAtFiling: is_numeric($ageAtFiling) ? (int) $ageAtFiling : null,
            sex: filled($values['sex'] ?? null) ? (string) $values['sex'] : null,
            educationalAttainment: filled($values['educational_attainment'] ?? null)
                ? (string) $values['educational_attainment']
                : null,
            occupation: filled($values['occupation'] ?? null)
                ? trim((string) $values['occupation'])
                : null,
            monthlyIncome: is_numeric($monthlyIncome) ? (float) $monthlyIncome : null,
            isHouseholdHead: array_key_exists('is_household_head', $values)
                ? (bool) $values['is_household_head']
                : $relationship === 'head',
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'household_member_id' => $this->householdMemberId,
            'beneficiary_id' => $this->beneficiaryId,
            'full_name' => $this->fullName,
            'relationship' => $this->relationship,
            'birth_date' => $this->birthDate,
            'age_at_filing' => $this->ageAtFiling,
            'sex' => $this->sex,
            'educational_attainment' => $this->educationalAttainment,
            'occupation' => $this->occupation,
            'monthly_income' => $this->monthlyIncome,
            'is_household_head' => $this->isHouseholdHead,
        ];
    }
}
