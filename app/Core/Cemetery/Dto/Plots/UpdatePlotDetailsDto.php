<?php

namespace App\Core\Cemetery\Dto\Plots;

final readonly class UpdatePlotDetailsDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $plotId,
        public string $name,
        public string $type,
    ) {}

    public static function fromRequest(array $validated, string $cemeterySiteId, string $plotId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            plotId: $plotId,
            name: mb_strtoupper(trim($validated['name'])),
            type: $validated['type'],
        );
    }
}
