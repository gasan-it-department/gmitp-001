<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use Carbon\CarbonImmutable;

readonly class CreateBeneficiaryProfileDto
{
    /**
     * Version tag for the registration terms + general privacy notice the
     * citizen agrees to at profile-setup time. Bump this when the notice copy
     * materially changes — historical beneficiaries stay pinned to whichever
     * version they originally accepted.
     */
    public const TERMS_VERSION = 'v1.0';

    public function __construct(
        public string $userId,
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

        // Civil status / employment / income — paper-form parity with
        // ac_household_members. Drives indigency assessment downstream.
        public string $civilStatus,
        public string $occupation,
        public float $monthlyIncome,

        // Home address — written to ac_households
        public string $barangay,
        public ?string $barangayCode,
        public ?string $street,

        // ── Data Privacy Act (RA 10173) consent ──────────────────────────────
        // Server-stamped at the moment the citizen submits the wizard. The
        // FormRequest enforced `terms_consent` => accepted, so by the time the
        // DTO is built we know the box was ticked.
        public CarbonImmutable $termsConsentedAt,
        public string $termsVersion,

        // ── Household composition (entered alongside identity) ───────────────
        // Pure-primitives array; each entry will be hydrated into a
        // StoreHouseholdMemberDto in the action and persisted via
        // StoreHouseholdMemberAction inside the same DB transaction as the
        // beneficiary row. Empty array = citizen chose to skip.
        //
        // @var array<int, array<string, mixed>>
        public array $householdMembers = [],
    ) {
    }

    public static function fromArray(array $data, string $userId, string $municipalId): self
    {
        return new self(
            // IDs are left exactly as they are
            userId: $userId,
            municipalId: $municipalId,

            // Required strings converted to uppercase
            firstName: mb_strtoupper($data['first_name']),
            lastName: mb_strtoupper($data['last_name']),

            // Optional strings checked before uppercasing
            middleName: !empty($data['middle_name']) ? mb_strtoupper($data['middle_name']) : null,
            suffix: !empty($data['suffix']) ? mb_strtoupper($data['suffix']) : null,

            // Explicitly left exactly as provided
            sex: $data['sex'],
            birthDate: $data['birth_date'],

            // Religion is a UUID/ULID, so we leave it alone
            religionId: $data['religion_id'] ?? null,

            educationalAttainment: !empty($data['educational_attainment']) ? $data['educational_attainment'] : null,

            // Civil status — stored as the enum's backing string value (lowercase).
            // The model casts it back to CivilStatus on read.
            civilStatus: $data['civil_status'],
            // Occupation is a free-text descriptor; uppercase for display
            // consistency with the rest of the identity columns.
            occupation: mb_strtoupper($data['occupation']),
            // Cast to float because the DB column is decimal(10,2). The
            // FormRequest already validated numeric + min:0.
            monthlyIncome: (float) $data['monthly_income'],

            // Address details uppercase
            barangay: mb_strtoupper($data['barangay']),
            barangayCode: $data['barangay_code'] ?? null,
            street: !empty($data['street']) ? mb_strtoupper($data['street']) : null,

            // Consent is server-stamped, not trusted from the request payload.
            termsConsentedAt: CarbonImmutable::now(),
            termsVersion: self::TERMS_VERSION,

            // Household members carried through as-is (associative arrays).
            // Action will iterate and hand each one to StoreHouseholdMemberDto.
            // Missing key → empty array = citizen skipped the section.
            householdMembers: $data['household_members'] ?? [],
        );
    }
}
