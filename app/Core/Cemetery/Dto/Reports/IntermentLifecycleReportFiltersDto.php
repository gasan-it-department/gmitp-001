<?php

namespace App\Core\Cemetery\Dto\Reports;

class IntermentLifecycleReportFiltersDto
{
    public function __construct(
        public readonly ?string $siteId,
        public readonly ?string $sectionId,
        public readonly ?string $blockId,
        public readonly string $lifecycleStatus = 'all',
        public readonly ?string $endType = null,
        public readonly ?string $dateFrom = null,
        public readonly ?string $dateTo = null,
        public readonly int $perPage = 15,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            siteId: self::nullableString($filters['site_id'] ?? null),
            sectionId: self::nullableString($filters['section_id'] ?? null),
            blockId: self::nullableString($filters['block_id'] ?? null),
            lifecycleStatus: self::nullableString($filters['lifecycle_status'] ?? null) ?: 'all',
            endType: self::nullableString($filters['end_type'] ?? null),
            dateFrom: self::nullableString($filters['date_from'] ?? null),
            dateTo: self::nullableString($filters['date_to'] ?? null),
            perPage: filled($filters['per_page'] ?? null) ? (int) $filters['per_page'] : 15,
        );
    }

    public function toArray(): array
    {
        return [
            'site_id' => $this->siteId,
            'section_id' => $this->sectionId,
            'block_id' => $this->blockId,
            'lifecycle_status' => $this->lifecycleStatus,
            'end_type' => $this->endType,
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

        return $value === '' || $value === 'all' ? null : $value;
    }
}
