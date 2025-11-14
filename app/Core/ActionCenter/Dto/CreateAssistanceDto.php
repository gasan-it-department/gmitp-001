<?php

namespace App\Core\ActionCenter\Dto;

class CreateAssistanceDto
{
    public function __construct(
        public readonly string $id,
        public readonly string $transactionNumber,
        public readonly string $assistanceType,
        public readonly string $description,
        public readonly string $status,
        public readonly string $userId,
    ) {
    }
}