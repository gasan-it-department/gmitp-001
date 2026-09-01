<?php

namespace App\Core\Auth\Dto;

readonly class SupabaseUserDto
{
    public function __construct(
        public string $providerId,
        public ?string $email,
        public ?string $phone,
        public bool $phoneConfirmed,
        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?string $avatarUrl = null,
    ) {}
}
