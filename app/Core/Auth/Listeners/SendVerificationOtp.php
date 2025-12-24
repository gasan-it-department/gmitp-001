<?php

namespace App\Core\Auth\Listeners;

use App\Core\Auth\Services\OtpService;
use App\Core\Auth\Services\VerificationSenderService;
use App\Core\Users\Events\UserRegistered;
use App\Shared\Sms\Service\SmsService;

class SendVerificationOtp
{

    public function __construct(
        protected VerificationSenderService $verificationSenderService
    ) {
    }

    public function handle(UserRegistered $event): void
    {

        $this->verificationSenderService->send($event->user->phone);

    }
}