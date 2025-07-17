<?php

namespace App\Domains\Users\Dtos;

//DTO = Data Transfer Object
//Constructor to set values.
// Used to transfer data in or out of your Domain/Service.
// Properties only — no Eloquent, no Facades, no DB calls.
class UserDto
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $phone,
        public readonly string $user_name,
        public readonly string $role,
        public readonly string $password,
    ) {
    }



}

