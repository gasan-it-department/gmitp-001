<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Shared\Phone\Services\PhoneFormatterService;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;

final readonly class CreateHouseholdBeneficiaryDto
{
    public const TERMS_VERSION = 'v1.0';

    public function __construct(
        public string $householdId,
        public string $municipalId,
        public string $encodedByUserId,
        public string $firstName,
        public string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public string $sex,
        public string $birthDate,
        public ?string $religionId,
        public ?string $educationalAttainment,
        public string $civilStatus,
        public ?string $occupation,
        public float $monthlyIncome,
        public ?string $contactPhone,
        public string $relationship,
        public CarbonImmutable $termsConsentedAt,
        public string $termsVersion,
        public bool $force,
        public bool $verifyNow,
        public ?UploadedFile $identityIdFront,
        public ?UploadedFile $identityIdBack,
    ) {}

    /** @param array<string, mixed> $data */
    public static function fromArray(
        array $data,
        string $householdId,
        string $municipalId,
        string $encodedByUserId,
        ?UploadedFile $identityIdFront,
        ?UploadedFile $identityIdBack,
        PhoneFormatterService $phoneFormatter,
    ): self {
        return new self(
            householdId: $householdId,
            municipalId: $municipalId,
            encodedByUserId: $encodedByUserId,
            firstName: mb_strtoupper($data['first_name']),
            lastName: mb_strtoupper($data['last_name']),
            middleName: filled($data['middle_name'] ?? null) ? mb_strtoupper($data['middle_name']) : null,
            suffix: filled($data['suffix'] ?? null) ? mb_strtoupper($data['suffix']) : null,
            sex: $data['sex'],
            birthDate: $data['birth_date'],
            religionId: $data['religion_id'] ?? null,
            educationalAttainment: filled($data['educational_attainment'] ?? null)
                ? $data['educational_attainment']
                : null,
            civilStatus: $data['civil_status'],
            occupation: filled($data['occupation'] ?? null) ? mb_strtoupper($data['occupation']) : null,
            monthlyIncome: (float) $data['monthly_income'],
            contactPhone: filled($data['contact_phone'] ?? null)
                ? $phoneFormatter->normalize((string) $data['contact_phone'])
                : null,
            relationship: $data['relationship'],
            termsConsentedAt: CarbonImmutable::now(),
            termsVersion: self::TERMS_VERSION,
            force: (bool) ($data['force'] ?? false),
            verifyNow: (bool) ($data['verify_now'] ?? false),
            identityIdFront: $identityIdFront,
            identityIdBack: $identityIdBack,
        );
    }
}
