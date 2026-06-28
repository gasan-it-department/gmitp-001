<?php

namespace App\Core\Cemetery\Dto\Blocks;

final readonly class CemeteryBlockDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $sectionId,
        public string $name,
    ) {}

    public static function fromRequest(array $data, string $cemeterySiteId, string $sectionId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            sectionId: $sectionId,
            name: mb_strtoupper(trim($data['name'])),
        );
    }
}
