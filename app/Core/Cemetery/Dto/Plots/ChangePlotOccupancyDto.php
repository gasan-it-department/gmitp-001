<?php

namespace App\Core\Cemetery\Dto\Plots;

final readonly class ChangePlotOccupancyDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $plotId,
        public string $occupancyMode,
        public int $capacity,
        public string $reason,
    ) {}

    public static function fromRequest(array $validated, string $cemeterySiteId, string $plotId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            plotId: $plotId,
            occupancyMode: $validated['occupancy_mode'],
            capacity: (int) $validated['capacity'],
            reason: trim($validated['reason']),
        );
    }
}
