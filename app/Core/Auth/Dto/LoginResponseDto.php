<?php

namespace App\Core\Auth\Dto;

class LoginResponseDto
{
    public function __construct(
        public readonly string $message,
        public readonly ?string $accessToken,
        public readonly string $tokenType,
        public readonly int $expiresIn,
        public readonly array $user,
    ) {
    }

    public function toArray(): array
    {
        return [
            'message' => $this->message,
            'access_token' => $this->accessToken,
            'token_type' => $this->tokenType,
            'expires_in' => $this->expiresIn,
            'user' => $this->user,
        ];
    }
}