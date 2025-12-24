<?php

namespace App\Core\Auth\Dto;

class LoginResponseDto
{
    public function __construct(
        public readonly string $message,
        public readonly ?string $accessToken,
        public readonly string $tokenType,
        public readonly int $expiresIn,
        public readonly object $user,
    ) {
    }
}