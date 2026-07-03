<?php

namespace App\Core\Cemetery\Dto\Reports;

class PlotInventoryReportFiltersDto
{
    public const SCOPE_ASSIGNABLE = 'assignable';

    public const SCOPE_CONTAINERS = 'containers';

    public const SCOPE_ALL = 'all';

    public function __construct(
        public readonly ?string $siteId,
        public readonly ?string $sectionId,
        public readonly ?string $blockId,
        public readonly ?string $type,
        public readonly ?string $status,
        public readonly ?string $occupancyMode,
        public readonly string $scope = self::SCOPE_ASSIGNABLE,
        public readonly int $perPage = 15,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            siteId: self::nullableString($filters['site_id'] ?? null),
            sectionId: self::nullableString($filters['section_id'] ?? null),
            blockId: self::nullableString($filters['block_id'] ?? null),
            type: self::nullableString($filters['type'] ?? null),
            status: self::nullableString($filters['status'] ?? null),
            occupancyMode: self::nullableString($filters['occupancy_mode'] ?? null),
            scope: self::nullableString($filters['scope'] ?? null) ?: self::SCOPE_ASSIGNABLE,
            perPage: filled($filters['per_page'] ?? null) ? (int) $filters['per_page'] : 15,
        );
    }

    public function toArray(): array
    {
        return [
            'site_id' => $this->siteId,
            'section_id' => $this->sectionId,
            'block_id' => $this->blockId,
            'type' => $this->type,
            'status' => $this->status,
            'occupancy_mode' => $this->occupancyMode,
            'scope' => $this->scope,
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
