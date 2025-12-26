<?php

namespace App\Core\Auth\Services;

use Illuminate\Support\Facades\Log;
use App\Shared\Sms\Service\SmsService;

class VerificationSenderService
{
    public function __construct(

        protected OtpService $otpService,
        protected SmsService $smsService,

    ) {
    }

    public function send(string $phoneNumber)
    {

        $code = $this->otpService->generate($phoneNumber, 'sms');

        $senderName = config('app.sms_sender_name');

        $message = "{$senderName}: Your Verification Code is: {$code}. Do not share this with anyone.";

        $this->smsService->send($phoneNumber, $message);

        Log::info("VerificationSender: Sent OTP {$code} to {$phoneNumber}");

    }
}