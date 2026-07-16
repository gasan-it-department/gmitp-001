<?php

namespace App\Core\Cemetery\Dto\Blocks;

final readonly class UpdateCemeteryBlockDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $sectionId,
        public string $blockId,
        public string $name,
    ) {}

    public static function fromRequest(array $data, string $cemeterySiteId, string $sectionId, string $blockId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            sectionId: $sectionId,
            blockId: $blockId,
            name: mb_strtoupper(trim($data['name'])),
        );
    }
}
