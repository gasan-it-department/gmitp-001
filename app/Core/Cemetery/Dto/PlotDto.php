<?php

namespace App\Core\Cemetery\Dto;

/**
 * Immutable transport for "register plot" — single OR multi-capacity.
 *
 * Tenancy (SR-1): `municipalId` is sourced from `app('municipal_id')` at the
 * factory call site, never from the request payload. Identifiers (name, row,
 * position) are persisted UPPERCASE (SR-3).
 *
 * Capacity semantics:
 *   capacity == 1  → BulkGenerateMultiCapacityPlotsAction creates ONE plot row,
 *                    no children. Interments attach directly (FR-1).
 *   capacity >  1  → it creates a PARENT container + N CHILD slot rows in a
 *                    single transaction (FR-2). Children inherit name/type/row;
 *                    `position` is NULL on children (admin edits post-create
 *                    per BR-5). Bounds 1..50 (BR-9) enforced by the Request.
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

        return $trimmed === '' ? null : strtoupper($trimmed);
    }
}
