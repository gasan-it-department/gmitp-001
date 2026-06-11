<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use Carbon\CarbonImmutable;

/**
 * Pure-primitives DTO for an ADMIN-encoded walk-in beneficiary.
 *
 * Mirrors CreateBeneficiaryProfileDto (the online self-registration path) but
 * for the in-office workflow where the applicant has NO portal account:
 *
 *   • No $userId — the created ac_beneficiaries row carries user_id = NULL.
 *     (The DB's UNIQUE(user_id) allows multiple NULLs, so it provides ZERO
 *     duplicate protection here — that's why the action runs a soft name+DOB
 *     duplicate check instead.)
 *   • $encodedByUserId — the admin acting on the applicant's behalf, recorded
 *     in the activity log (the online flow's actor IS the beneficiary).
 *   • Consent (RA 10173) is obtained in person; the admin affirms it on the
 *     form. We still server-stamp terms_consented_at + version for evidence.
 *   • $force — set true to bypass the soft duplicate guard after the admin has
 *     reviewed the surfaced matches and confirmed this is a different person.
 *
 * Identity strings are uppercased here for parity with the online flow and the
 * rest of the ac_beneficiaries identity columns. Enum-backed values (sex,
 * civil_status) and IDs (religion_id) are left exactly as provided.
 */
readonly class CreateWalkInBeneficiaryDto
{
    /** Same notice version the online registration pins (keep in lockstep). */
    public const TERMS_VERSION = 'v1.0';

    public function __construct(
        public string $encodedByUserId,
        public string $municipalId,

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

        // Home address — written to ac_households
        public string $barangay,
        public ?string $barangayCode,
        public ?string $street,

        // Data Privacy Act (RA 10173) consent — admin-affirmed, server-stamped.
        public CarbonImmutable $termsConsentedAt,
        public string $termsVersion,

        // Override the soft duplicate guard after admin review.
        public bool $force,

        // Admin chooses whether this in-person intake is trusted immediately.
        public bool $verifyNow,

        // Household composition (optional). Same primitive-array shape the
        // online flow uses; each entry is hydrated into a StoreHouseholdMemberDto
        // inside the action's transaction.
        //
        // @var array<int, array<string, mixed>>
        public array $householdMembers = [],
    ) {}

    /**
     * Build from the validated FormRequest plus controller context.
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data, string $encodedByUserId, string $municipalId): self
    {
        return new self(
            encodedByUserId: $encodedByUserId,
            municipalId: $municipalId,

            // Names uppercased; NOT the enums.
            firstName: mb_strtoupper($data['first_name']),
            lastName: mb_strtoupper($data['last_name']),
            middleName: ! empty($data['middle_name']) ? mb_strtoupper($data['middle_name']) : null,
            suffix: ! empty($data['suffix']) ? mb_strtoupper($data['suffix']) : null,

            // Left exactly as provided (enum backing value / raw date).
            sex: $data['sex'],
            birthDate: $data['birth_date'],

            // Religion is a ULID FK — leave alone.
            religionId: $data['religion_id'] ?? null,

            educationalAttainment: ! empty($data['educational_attainment'])
                ? mb_strtoupper($data['educational_attainment'])
                : null,

            // Enum backing string (lowercase) — model casts it back on read.
            civilStatus: $data['civil_status'],
            occupation: mb_strtoupper($data['occupation']),
            monthlyIncome: (float) $data['monthly_income'],

            // Address details uppercased; code (PSGC) left alone.
            barangay: mb_strtoupper($data['barangay']),
            barangayCode: $data['barangay_code'] ?? null,
            street: ! empty($data['street']) ? mb_strtoupper($data['street']) : null,

            // Consent is server-stamped, never trusted from the payload.
            termsConsentedAt: CarbonImmutable::now(),
            termsVersion: self::TERMS_VERSION,

            force: (bool) ($data['force'] ?? false),
            verifyNow: (bool) ($data['verify_now'] ?? false),

            householdMembers: $data['household_members'] ?? [],
        );
    }
}
