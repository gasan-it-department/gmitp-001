<?php

namespace App\Core\Auth\Listeners;

use App\Core\Auth\Services\OtpService;
use App\Core\Users\Events\UserRegistered;
use App\Shared\Sms\Service\SmsService;

class SendVerificationOtp
{

    public function __construct(
        protected OtpService $otpService,
        protected SmsService $smsService
    ) {
    }

    public function handle(UserRegistered $event): void
    {

        $code = $this->otpService->generate($event->user->phone, 'sms');

        $message = "Your Verification Code is: {$code}. Do not share this with anyone.";

        // $this->smsService->send($event->user->phone, $message);

        \Log::info("Sent OTP {$code} to {$event->user->phone}");

    }
}