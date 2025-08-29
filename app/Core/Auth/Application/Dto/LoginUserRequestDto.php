<?php

namespace App\Domain\Auth\DTOs;

class LoginUserRequestDto
{
    public function __construct(
        public readonly string $user_name,
        public readonly string $password,
        public readonly bool $remember_me = false
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            user_name: $data['user_name'] ?? '',
            password: $data['password'] ?? '',
            remember_me: (bool) ($data['remember_me'] ?? false)
        );
    }

    public function toArray(): array
    {
        return [
            'user_name' => $this->user_name,
            'password' => $this->password,
            'remember_me' => $this->remember_me,
        ];
    }
}