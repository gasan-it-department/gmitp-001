<?php

namespace App\Core\Auth\Dto;

class LoginRequestDto
{
    public function __construct(
        public string $identifier, //username or phone
        public string $password,
        public bool $rememberMe,
    ) {
    }


}