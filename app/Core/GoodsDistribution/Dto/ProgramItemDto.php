<?php

namespace App\Core\GoodsDistribution\Dto;

final readonly class ProgramItemDto
{
    public function __construct(
        public string $municipalId,
        public string $actorId,
        public string $programId,
        public string $itemId,
        public bool $isActive = true,
        public bool $reactivateGlobal = false,
    ) {}
}
