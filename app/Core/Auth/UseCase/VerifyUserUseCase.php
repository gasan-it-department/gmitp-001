<?php

namespace App\Core\Auth\UseCase;

use App\Core\Auth\Dto\VerifyPhoneDto;
use App\Core\Auth\Services\OtpService;
use App\Core\Auth\Events\PhoneVerified;
use App\Core\Auth\Exceptions\InvalidOtpExceptions;

class VerifyUserUseCase
{

    public function __construct(
        private OtpService $otpService,
    ) {
    }

    public function execute(VerifyPhoneDto $dto)
    {

        if (!$this->otpService->validate($dto->phoneNumber, $dto->otp)) {

            throw InvalidOtpExceptions::create();

        }

        PhoneVerified::dispatch($dto->userId);

    }

}