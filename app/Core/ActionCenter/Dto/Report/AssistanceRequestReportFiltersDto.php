<?php

namespace App\Core\ActionCenter\Dto\Report;

class AssistanceRequestReportFiltersDto
{
    public const DATE_SUBMITTED = 'submitted';

    public const DATE_RELEASED = 'released';

    public const SOURCE_PORTAL = 'portal';

    public const SOURCE_WALK_IN = 'walk_in';

    public function __construct(
        public readonly ?string $search = null,
        public readonly ?string $status = null,
        public readonly ?string $assistanceTypeId = null,
        public readonly ?string $barangay = null,
        public readonly ?string $source = null,
        public readonly string $dateBasis = self::DATE_SUBMITTED,
        public readonly ?string $dateFrom = null,
        public readonly ?string $dateTo = null,
        public readonly int $perPage = 15,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            status: self::nullableString($filters['status'] ?? null),
            assistanceTypeId: self::nullableString($filters['assistance_type_id'] ?? null),
            barangay: self::nullableString($filters['barangay'] ?? null),
            source: self::nullableString($filters['source'] ?? null),
            dateBasis: self::nullableString($filters['date_basis'] ?? null) ?: self::DATE_SUBMITTED,
            dateFrom: self::nullableString($filters['date_from'] ?? null),
            dateTo: self::nullableString($filters['date_to'] ?? null),
            perPage: max(10, min((int) ($filters['per_page'] ?? 15), 100)),
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'status' => $this->status,
            'assistance_type_id' => $this->assistanceTypeId,
            'barangay' => $this->barangay,
            'source' => $this->source,
            'date_basis' => $this->dateBasis,
            'date_from' => $this->dateFrom,
            'date_to' => $this->dateTo,
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
