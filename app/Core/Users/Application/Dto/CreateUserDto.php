<?php

namespace App\Core\Users\Application\Dto;
//DTO = Data Transfer Object
//Constructor to set values.
// Used to transfer data in or out of your Domain/Service.
// Properties only — no Eloquent, no Facades, no DB calls.
class CreateUserDto
{
    public function __construct(
        public readonly string $first_name,
        public readonly ?string $middle_name,
        public readonly string $last_name,
        public readonly string $user_name,
        public readonly string $phone,
        public readonly string $password,
        public readonly ?string $id = null,
        public readonly ?string $role = 'client',
    ) {
    }

}
