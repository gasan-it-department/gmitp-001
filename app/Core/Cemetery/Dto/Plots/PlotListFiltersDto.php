<?php

namespace App\Core\Cemetery\Dto\Plots;

class PlotListFiltersDto
{
    public const SCOPE_TOP_LEVEL = 'top_level';

    public const SCOPE_ASSIGNABLE = 'assignable';

    public const SCOPE_ALL = 'all';

    public function __construct(
        public readonly ?string $search,
        public readonly ?string $status,
        public readonly ?string $type,
        public readonly ?string $sectionId,
        public readonly ?string $blockId,
        public readonly ?string $row,
        public readonly string $scope = self::SCOPE_TOP_LEVEL,
        public readonly int $perPage = 15,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            status: self::nullableString($filters['status'] ?? null),
            type: self::nullableString($filters['type'] ?? null),
            sectionId: self::nullableString($filters['section_id'] ?? null),
            blockId: self::nullableString($filters['block_id'] ?? null),
            row: self::nullableString($filters['row'] ?? null),
            scope: self::nullableString($filters['scope'] ?? null) ?: self::SCOPE_TOP_LEVEL,
            perPage: filled($filters['per_page'] ?? null) ? (int) $filters['per_page'] : 15,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'status' => $this->status,
            'type' => $this->type,
            'section_id' => $this->sectionId,
            'block_id' => $this->blockId,
            'row' => $this->row,
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
