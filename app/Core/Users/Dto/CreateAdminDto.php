<?php

namespace App\Core\Users\Dto;

class CreateAdminDto
{
    public function __construct(

        public readonly string $firstName,
        public readonly ?string $middleName,
        public readonly string $lastName,
        public readonly string $userName,
        public readonly string $phone,
        public readonly string $password,
        public readonly string $role,
        public readonly \DateTimeImmutable $verified,
        public readonly ?array $permissions = null,

    ) {
    }
}