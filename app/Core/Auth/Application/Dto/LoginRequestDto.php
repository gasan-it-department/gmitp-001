<?php

namespace App\Core\Auth\Application\Dto;

readonly class LoginRequestDto
{
    public function __construct(
        public readonly string $user_name,
        public readonly string $password,
        public readonly bool $remember_me = false,
        public readonly ?string $ip_address = null,
        public readonly ?string $user_agent = null,
    ) {
    }
}