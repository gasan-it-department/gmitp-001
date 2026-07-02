<?php

namespace App\Core\Cemetery\Dto\Plots;

final readonly class DeletePlotDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $plotId,
        public string $reason,
    ) {}

    public static function fromRequest(array $validated, string $cemeterySiteId, string $plotId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            plotId: $plotId,
            reason: trim($validated['reason']),
        );
    }
}
