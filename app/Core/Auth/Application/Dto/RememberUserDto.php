<?php

namespace App\Core\Auth\Application\Dto;

class RememberUserDto
{
    public function __construct(
        public readonly string $token
    ) {
    }
}