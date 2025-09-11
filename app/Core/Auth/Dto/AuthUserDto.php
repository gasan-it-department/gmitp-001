<?php

namespace App\Core\Auth\Dto;
class AuthUserDto
{
    public function __construct(
        private string $uuid,
        private string $userName,
        private string $phone
    ) {
    }
}
