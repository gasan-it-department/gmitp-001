<?php

namespace App\Core\Auth\Listeners;

use App\Core\Auth\Services\VerificationSenderService;
use App\Core\Users\Events\UserRegistered;
use Illuminate\Events\Attributes\Listen;

#[Listen(UserRegistered::class)]
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