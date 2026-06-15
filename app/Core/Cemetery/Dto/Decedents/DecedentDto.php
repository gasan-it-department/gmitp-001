<?php

namespace App\Core\Cemetery\Dto\Decedents;

use Illuminate\Http\UploadedFile;

final readonly class DecedentDto
{
    public function __construct(
        public string $municipalId,
        public string $vitalRecordType,
        public string $identityStatus,
        public bool $hasLegalName,
        public string $submissionIntent,
        public ?int $version,
        public ?string $firstName,
        public ?string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public ?string $memorialName,
        public ?string $gender,
        public ?string $dateOfBirth,
        public ?string $dateOfDeath,
        public string $dateOfRegistration,
        public ?string $registryNumber,
        public ?string $causeOfDeath,
        public ?string $placeOfDeath,
        public ?string $notes,
        public ?int $psgcMunicipalityId,
        public ?string $psgcBarangayCode,
        public ?string $streetName,
        public array $unidentifiedDetails,
        public array $fetalDetails,
        public array $documents,
        public ?UploadedFile $avatar,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            municipalId: app('municipal_id'),
            vitalRecordType: $data['vital_record_type'],
            identityStatus: $data['identity_status'],
            hasLegalName: (bool) ($data['has_legal_name'] ?? false),
            submissionIntent: $data['submission_intent'] ?? 'draft',
            version: isset($data['version']) ? (int) $data['version'] : null,
            firstName: self::upper($data['first_name'] ?? null),
            lastName: self::upper($data['last_name'] ?? null),
            middleName: self::upper($data['middle_name'] ?? null),
            suffix: self::upper($data['suffix'] ?? null),
            memorialName: self::upper($data['memorial_name'] ?? null),
            gender: self::upper($data['gender'] ?? null),
            dateOfBirth: $data['date_of_birth'] ?? null,
            dateOfDeath: $data['date_of_death'] ?? null,
            dateOfRegistration: $data['date_of_registration'],
            registryNumber: self::upper($data['registry_number'] ?? null),
            causeOfDeath: self::upper($data['cause_of_death'] ?? null),
            placeOfDeath: self::upper($data['place_of_death'] ?? null),
            notes: self::clean($data['notes'] ?? null),
            psgcMunicipalityId: filled($data['psgc_municipality_id'] ?? null)
                ? (int) $data['psgc_municipality_id']
                : null,
            psgcBarangayCode: self::clean($data['psgc_barangay_code'] ?? null),
            streetName: self::upper($data['street_name'] ?? null),
            unidentifiedDetails: self::normalizeArray($data['unidentified_details'] ?? []),
            fetalDetails: self::normalizeArray($data['fetal_details'] ?? []),
            documents: $data['documents'] ?? [],
            avatar: $data['avatar'] ?? null,
        );
    }

    private static function normalizeArray(array $values): array
    {
        return array_map(
            fn ($value) => is_string($value) ? self::upper($value) : $value,
            $values
        );
    }

    private static function upper(?string $value): ?string
    {
        $clean = self::clean($value);

        return $clean === null ? null : mb_strtoupper($clean);
    }

    private static function clean(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
