<?php

namespace App\Core\ActionCenter\Dto\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;

/**
 * Pure-primitives DTO for adding one row to ac_household_members.
 *
 * Used by every entry point that creates a household member:
 *   - CreateBeneficiaryProfileAction (fan-out at profile setup)
 *   - DeclareHouseholdMemberForAssistanceAction (citizen on-behalf-of modal)
 *   - Future admin household editor during under_review
 *
 * NO model references — the calling action resolves household_id from
 * context (the loaded beneficiary, the route binding, etc.) and passes
 * it in as a primitive ULID string.
 */
readonly class StoreHouseholdMemberDto
{
    public function __construct(
        public string $householdId,

        // Identity
        public string $firstName,
        public string $lastName,
        public ?string $middleName,
        public ?string $suffix,

        // Relationship to the household's beneficiary head
        public string $relationship,

        // Demographics (nullable — citizen may not always know)
        public ?string $birthDate,
        public ?string $sex,
        public ?string $civilStatus,
        public ?string $educationalAttainment,

        // Economic context (nullable — admin can backfill during interview)
        public ?string $occupation,
        public ?float $monthlyIncome,

        // Optional religion FK
        public ?string $religionId,
    ) {
    }

    /**
     * Build the self-referencing "head of household" row from a freshly
     * created Beneficiary. Mirrors every identity / demographic / economic
     * field from the beneficiary so the household_members table holds a
     * complete picture of who lives in the home — including the citizen
     * themselves, not just their dependents.
     *
     * Always uses Relationship::Head for the relationship field; the
     * action layer enforces "only one Head per household."
     */
    public static function fromBeneficiary(Beneficiary $beneficiary): self
    {
        return new self(
            householdId: $beneficiary->household_id,

            firstName: $beneficiary->first_name,
            lastName: $beneficiary->last_name,
            middleName: $beneficiary->middle_name,
            suffix: $beneficiary->suffix,

            relationship: Relationship::Head->value,

            birthDate: $beneficiary->birth_date?->toDateString(),
            sex: $beneficiary->sex,
            civilStatus: $beneficiary->civil_status?->value,
            educationalAttainment: $beneficiary->educational_attainment?->value,

            occupation: $beneficiary->occupation,
            monthlyIncome: $beneficiary->monthly_income !== null
            ? (float) $beneficiary->monthly_income
            : null,

            religionId: $beneficiary->religion_id,
        );
    }

    /**
     * Build from a validated FormRequest array. Uppercases identity strings
     * for display consistency with the rest of the beneficiary identity
     * columns (first_name, last_name, etc. on ac_beneficiaries are also
     * normalized this way).
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data, string $householdId): self
    {
        return new self(
            householdId: $householdId,

            firstName: mb_strtoupper($data['first_name']),
            lastName: mb_strtoupper($data['last_name']),
            middleName: !empty($data['middle_name']) ? mb_strtoupper($data['middle_name']) : null,
            suffix: !empty($data['suffix']) ? mb_strtoupper($data['suffix']) : null,

            relationship: $data['relationship'],

            birthDate: $data['birth_date'] ?? null,
            sex: $data['sex'] ?? null,
            civilStatus: $data['civil_status'] ?? null,
            educationalAttainment: !empty($data['educational_attainment'])
            ? $data['educational_attainment']
            : null,

            occupation: !empty($data['occupation']) ? mb_strtoupper($data['occupation']) : null,
            monthlyIncome: isset($data['monthly_income']) ? (float) $data['monthly_income'] : null,

            religionId: $data['religion_id'] ?? null,
        );
    }
}
