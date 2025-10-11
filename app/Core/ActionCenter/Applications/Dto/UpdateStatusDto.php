<?php

namespace App\Core\ActionCenter\Applications\Dto;

class UpdateStatusDto
{
    public function __construct(
        public readonly string $id,
        public readonly string $newStatus,
        public readonly string $userId
    ) {
    }
}