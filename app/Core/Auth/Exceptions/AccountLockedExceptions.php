<?php

namespace App\Core\Auth\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class AccountLockedExceptions extends DomainException
{
    public function __construct(int $remainingMinutes = 0)
    {
        $message = "Temporarily locked. Try again in {$remainingMinutes} minutes.";
        parent::__construct($message);
    }

    public function status(): int
    {
        return 423; // Locked
    }

    public function errorCode(): string
    {
        return 'AUTH_ACCOUNT_LOCKED';
    }
}
