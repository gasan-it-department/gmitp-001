<?php

namespace App\Core\Cemetery\Dto\Decedents;

class DecedentListFiltersDto
{
    public function __construct(
        public readonly ?string $search,
        public readonly ?string $registrationStatus,
        public readonly ?string $identityStatus,
        public readonly ?string $vitalRecordType,
        public readonly ?string $intermentStatus,
        public readonly ?int $deathYear,
        public readonly int $perPage = 10,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            registrationStatus: self::nullableString($filters['registration_status'] ?? null),
            identityStatus: self::nullableString($filters['identity_status'] ?? null),
            vitalRecordType: self::nullableString($filters['vital_record_type'] ?? null),
            intermentStatus: self::nullableString($filters['interment_status'] ?? null),
            deathYear: filled($filters['death_year'] ?? null) ? (int) $filters['death_year'] : null,
            perPage: filled($filters['per_page'] ?? null) ? (int) $filters['per_page'] : 10,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'registration_status' => $this->registrationStatus,
            'identity_status' => $this->identityStatus,
            'vital_record_type' => $this->vitalRecordType,
            'interment_status' => $this->intermentStatus,
            'death_year' => $this->deathYear,
            'per_page' => $this->perPage,
        ];
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
