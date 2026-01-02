<?php

namespace App\Core\ActionCenter\Requests\Dto;

class CreateAssistanceDto
{
    public function __construct(

        public readonly string $assistanceType,

        public readonly string $description,

        public readonly string $userId,

        public string $beneficiaryId,

        public ?array $files,

    ) {
    }
}