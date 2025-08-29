<?php

namespace App\Core\Auth\Application\Dto;

class LogoutResultDto
{
    public function __construct(
        public readonly string $success,
        public readonly ?string $message = null,
    ) {

    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'message' => $this->message,
        ];
    }
}