<?php

namespace App\Core\Cemetery\Dto\Reports;

class MissingDocumentsReportFiltersDto
{
    public function __construct(
        public readonly ?string $registrationStatus,
        public readonly ?string $vitalRecordType,
        public readonly ?string $missingDocumentType,
        public readonly ?string $intermentStatus,
        public readonly int $perPage = 15,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            registrationStatus: self::nullableString($filters['registration_status'] ?? null) ?: 'verified',
            vitalRecordType: self::nullableString($filters['vital_record_type'] ?? null),
            missingDocumentType: self::nullableString($filters['missing_document_type'] ?? null),
            intermentStatus: self::nullableString($filters['interment_status'] ?? null),
            perPage: filled($filters['per_page'] ?? null) ? (int) $filters['per_page'] : 15,
        );
    }

    public function toArray(): array
    {
        return [
            'registration_status' => $this->registrationStatus,
            'vital_record_type' => $this->vitalRecordType,
            'missing_document_type' => $this->missingDocumentType,
            'interment_status' => $this->intermentStatus,
            'per_page' => $this->perPage,
        ];
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' || $value === 'all' ? null : $value;
    }
}
