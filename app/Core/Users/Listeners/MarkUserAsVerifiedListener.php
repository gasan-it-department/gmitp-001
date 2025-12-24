<?php

namespace App\Core\Users\Listeners;

use App\Core\Auth\Events\PhoneVerified;
use App\Core\Users\Repository\UserRepository;

class MarkUserAsVerifiedListener
{
    public function __construct(
        private UserRepository $userRepository,
    ) {
    }

    public function handle(PhoneVerified $event)
    {

        $user = $this->userRepository->findById($event->userId);

        $user->phone_verified_at = now();

        $user->save();

    }
}