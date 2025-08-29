<?php

namespace App\Core\Auth\Application\Dto;

class AuthResponseDto
{
    public function __construct(
        public readonly string $token,
        public readonly \DateTime $expires_at,
        public readonly array $user_data,
        public readonly bool $isRemembered = false

    ) {
    }
    public function toArray(): array
    {
        return [
            'token' => $this->token,
            'expires_at' => $this->expires_at->format('Y-m-d H:i:s'),
            'user' => $this->user_data,
            'is_remembered' => $this->isRemembered,
        ];
    }


}