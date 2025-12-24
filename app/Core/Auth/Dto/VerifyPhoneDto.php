<?php

namespace App\Core\Auth\Dto;

class VerifyPhoneDto
{

    public function __construct(
        public string $userId,
        public string $phoneNumber,
        public string $otp
    ) {
    }

}