<?php

namespace App\Core\Auth\Application\Dto;

class LogoutUserDto
{
    public function __construct(
        public readonly string $token
    ) {
    }
}