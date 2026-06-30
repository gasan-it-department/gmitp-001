<?php

namespace App\Core\Cemetery\Dto;

/**
 * Immutable transport for plot registration. Capacity is the maximum number of
 * decedents/remains the same physical plot can hold.
 */
final readonly class PlotDto
{
    public function __construct(
        public string $municipalId,
        public string $blockId,
        public string $name,
        public string $type,
        public int $capacity,
        public ?string $row,
        public ?string $position,
        public string $cemeterySiteId,
    ) {}

    public static function fromRequest(array $validated, string $cemeterySiteId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            blockId: $validated['block_id'],
            name: self::upper($validated['name']) ?? '',
            type: $validated['type'],
            capacity: (int) $validated['capacity'],
            row: self::upper($validated['row'] ?? null),
            position: self::upper($validated['position'] ?? null),
            cemeterySiteId: $cemeterySiteId,
        );
    }

    private static function upper(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : mb_strtoupper($trimmed);
    }
}
