<?php

namespace App\Core\Auth\UseCase;

use App\Core\Auth\Interfaces\CookieSessionInterface;
class LogoutUser
{
    public function __construct(
        private CookieSessionInterface $sessionService,
    ) {
    }

    public function execute(): void
    {
        $this->sessionService->destroySession();
    }
}