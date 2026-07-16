<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Http\UploadedFile;

readonly class ResubmitBeneficiaryProfileCorrectionDto
{
    public function __construct(
        public string $userId,
        public string $municipalId,

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

        public string $barangay,
        public ?string $barangayCode,
        public ?string $street,

        /** @var array<int, array<string, mixed>> */
        public array $householdMembers = [],

        public ?UploadedFile $identityIdFront = null,
        public ?UploadedFile $identityIdBack = null,
    ) {
    }

    public static function fromArray(
        array $data,
        string $userId,
        string $municipalId,
        ?UploadedFile $identityIdFront = null,
        ?UploadedFile $identityIdBack = null,
        ?PhoneFormatterService $phoneFormatter = null,
    ): self {
        $phoneFormatter ??= app(PhoneFormatterService::class);

        $contactPhone = ! empty($data['contact_phone']) && $phoneFormatter !== null
            ? $phoneFormatter->normalize((string) $data['contact_phone'])
            : null;

        return new self(
            userId: $userId,
            municipalId: $municipalId,
            firstName: mb_strtoupper($data['first_name']),
            lastName: mb_strtoupper($data['last_name']),
            middleName: !empty($data['middle_name']) ? mb_strtoupper($data['middle_name']) : null,
            suffix: !empty($data['suffix']) ? mb_strtoupper($data['suffix']) : null,
            sex: $data['sex'],
            birthDate: $data['birth_date'],
            religionId: $data['religion_id'] ?? null,
            educationalAttainment: !empty($data['educational_attainment']) ? $data['educational_attainment'] : null,
            civilStatus: $data['civil_status'],
            occupation: !empty($data['occupation']) ? mb_strtoupper($data['occupation']) : null,
            monthlyIncome: isset($data['monthly_income']) ? (float) $data['monthly_income'] : 0.0,
            contactPhone: $contactPhone,
            barangay: mb_strtoupper($data['barangay']),
            barangayCode: $data['barangay_code'] ?? null,
            street: !empty($data['street']) ? mb_strtoupper($data['street']) : null,
            householdMembers: $data['household_members'] ?? [],
            identityIdFront: $identityIdFront,
            identityIdBack: $identityIdBack,
        );
    }
}
