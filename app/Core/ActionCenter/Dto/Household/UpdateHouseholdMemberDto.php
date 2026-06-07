<?php

namespace App\Core\ActionCenter\Dto\Household;

/**
 * Pure-primitives DTO for an ADMIN edit of one existing ac_household_members
 * row (a non-head roster entry). The head row is NOT editable here — it mirrors
 * the beneficiary and is corrected through UpdateBeneficiaryProfileAction.
 *
 * Identity strings are uppercased for parity with the create paths. Enum-backed
 * values (relationship, sex, civil_status) and the religion FK are left as-is.
 */
readonly class UpdateHouseholdMemberDto
{
    public function __construct(
        public string $memberId,
        public string $municipalId,

        // Identity
        public string $firstName,
        public string $lastName,
        public ?string $middleName,
        public ?string $suffix,

        // Relationship to the head (never 'head' — that is server-managed)
        public string $relationship,

        // Demographics (nullable)
        public ?string $birthDate,
        public ?string $sex,
        public ?string $civilStatus,
        public ?string $educationalAttainment,

        // Economic context (nullable)
        public ?string $occupation,
        public ?float $monthlyIncome,

        // Optional religion FK
        public ?string $religionId,
    ) {
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data, string $memberId, string $municipalId): self
    {
        return new self(
            memberId: $memberId,
            municipalId: $municipalId,

            firstName: mb_strtoupper($data['first_name']),
            lastName: mb_strtoupper($data['last_name']),
            middleName: ! empty($data['middle_name']) ? mb_strtoupper($data['middle_name']) : null,
            suffix: ! empty($data['suffix']) ? mb_strtoupper($data['suffix']) : null,

            relationship: $data['relationship'],

            birthDate: $data['birth_date'] ?? null,
            sex: $data['sex'] ?? null,
            civilStatus: $data['civil_status'] ?? null,
            educationalAttainment: ! empty($data['educational_attainment'])
                ? mb_strtoupper($data['educational_attainment'])
                : null,

            occupation: ! empty($data['occupation']) ? mb_strtoupper($data['occupation']) : null,
            monthlyIncome: isset($data['monthly_income']) ? (float) $data['monthly_income'] : null,

            religionId: $data['religion_id'] ?? null,
        );
    }
}
