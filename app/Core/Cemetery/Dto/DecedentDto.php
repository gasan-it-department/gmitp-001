<?php

namespace App\Core\Cemetery\Dto;

use Illuminate\Http\UploadedFile;

/**
 * Immutable transport for a decedent-create payload moving from the HTTP
 * boundary into the domain layer. All string fields are pre-normalised
 * (uppercased/trimmed) here so downstream use cases and repositories never
 * touch raw request data.
 */
final readonly class DecedentDto
{
    public function __construct(
        public ?string $firstName,
        public ?string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public ?string $gender,
        public ?string $memorialName,

        public ?string $dateOfBirth,
        public ?string $dateOfDeath,
        public string  $dateOfRegistration,

        public string  $decedentType,
        public ?string $causeOfDeath,
        public ?string $deathCertNumber,
        public ?string $notes,
        public ?string $placeOfDeath,
        public ?string $referenceDocumentType,
        public ?string $referenceDocumentNumber,

        public string  $municipalId,
        public ?string $psgcMunicipalityId,
        public ?string $psgcBarangayId,
        public ?string $streetName,

        // Identification layer (Spatie MediaLibrary). Carried as framework upload
        // value objects — matching the system-wide pattern (e.g. StoreAnnouncementDto).
        public ?UploadedFile $avatar = null,
        /** @var UploadedFile[] */
        public array $identificationFiles = [],
    ) {
    }

    public static function fromRequest(array $validated): self
    {
        $data = $validated;

        return new self(
            firstName: self::upper($data['first_name'] ?? null),
            lastName: self::upper($data['last_name'] ?? null),
            middleName: self::upper($data['middle_name'] ?? null),
            suffix: self::upper($data['suffix'] ?? null),
            gender: self::upper($data['gender'] ?? null),
            memorialName: self::upper($data['memorial_name'] ?? null),

            dateOfBirth: $data['date_of_birth'] ?? null,
            dateOfDeath: $data['date_of_death'] ?? null,
            dateOfRegistration: $data['date_of_registration'],

            decedentType: $data['decedent_type'],
            causeOfDeath: self::upper($data['cause_of_death'] ?? null),
            deathCertNumber: self::upper($data['death_certificate_no'] ?? null),
            notes: self::upper($data['notes'] ?? null),
            placeOfDeath: self::upper($data['place_of_death'] ?? null),
            referenceDocumentType: $data['reference_document_type'] ?? null,
            referenceDocumentNumber: self::upper($data['reference_document_number'] ?? null),

            municipalId: app('municipal_id'),
            psgcMunicipalityId: $data['psgc_municipal_id'] ?? null,
            psgcBarangayId: $data['psgc_barangay_id'] ?? null,
            streetName: self::upper($data['street_name'] ?? null),

            avatar: $data['avatar'] ?? null,
            identificationFiles: $data['identification'] ?? [],
        );
    }

    private static function upper(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : strtoupper($trimmed);
    }
}
