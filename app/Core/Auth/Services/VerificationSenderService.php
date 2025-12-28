<?php

namespace App\Core\Auth\Services;

use Illuminate\Support\Facades\Log;
use App\Shared\Sms\Contracts\SmsProviderInterface;

class VerificationSenderService
{
    public function __construct(

        protected OtpService $otpService,

    ) {
    }

    public function send(string $phoneNumber)
    {

        $this->otpService->generate(
            $phoneNumber,
            OtpService::PURPOSE_REGISTER
        );

    }
}