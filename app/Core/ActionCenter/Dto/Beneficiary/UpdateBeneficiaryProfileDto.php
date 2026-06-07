<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\External\Api\Request\ActionCenter\Beneficiary\UpdateBeneficiaryProfileRequest;

/**
 * Pure-primitives DTO for an ADMIN correction to an existing beneficiary's
 * identity / demographics / economic profile.
 *
 * Carries ONLY the fields an admin is allowed to fix after registration:
 *   • hard identity (name parts, sex, birth date)
 *   • demographics (religion, educational attainment, civil status)
 *   • economic context (occupation, monthly income)
 *
 * It deliberately does NOT carry — and the action never writes —
 * beneficiary_number (lifelong ID), user_id (managed by the link-account
 * action), terms_consented_at / terms_version (the original consent record),
 * or household_id (relocation is a separate flow). Address lives on the
 * household and is corrected through its own path.
 *
 * Identity strings are uppercased for parity with the create path and the rest
 * of the ac_beneficiaries identity columns. Enum-backed values (sex,
 * civil_status) and the religion FK (ULID) are left exactly as provided.
 */
readonly class UpdateBeneficiaryProfileDto
{
    public function __construct(
        // Context — who/what is being corrected, and the tenant + actor.
        public string $beneficiaryId,
        public string $municipalId,
        public string $actingAdminId,

        // Personal identity
        public string $firstName,
        public string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public string $sex,
        public string $birthDate,
        public ?string $religionId,
        public ?string $educationalAttainment,

        // Civil status / employment / income
        public string $civilStatus,
        public string $occupation,
        public float $monthlyIncome,
    ) {
    }

    /**
     * Build from the validated FormRequest plus controller context.
     */
    public static function fromRequest(
        UpdateBeneficiaryProfileRequest $request,
        string $beneficiaryId,
        string $municipalId,
        string $actingAdminId,
    ): self {
        return new self(
            beneficiaryId: $beneficiaryId,
            municipalId: $municipalId,
            actingAdminId: $actingAdminId,

            // Names uppercased; NOT the enums.
            firstName: mb_strtoupper($request->string('first_name')->toString()),
            lastName: mb_strtoupper($request->string('last_name')->toString()),
            middleName: $request->filled('middle_name')
                ? mb_strtoupper($request->string('middle_name')->toString())
                : null,
            suffix: $request->filled('suffix')
                ? mb_strtoupper($request->string('suffix')->toString())
                : null,

            // Left exactly as provided (enum backing value / raw date).
            sex: $request->string('sex')->toString(),
            birthDate: $request->string('birth_date')->toString(),

            // Religion is a ULID FK — leave alone.
            religionId: $request->filled('religion_id')
                ? $request->string('religion_id')->toString()
                : null,

            educationalAttainment: $request->filled('educational_attainment')
                ? mb_strtoupper($request->string('educational_attainment')->toString())
                : null,

            // Enum backing string (lowercase) — model casts it back on read.
            civilStatus: $request->string('civil_status')->toString(),
            occupation: mb_strtoupper($request->string('occupation')->toString()),
            monthlyIncome: (float) $request->input('monthly_income'),
        );
    }
}
