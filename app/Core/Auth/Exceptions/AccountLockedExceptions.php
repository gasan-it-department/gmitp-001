<?php

namespace App\Core\Auth\Exceptions;

use Exception;

class AccountLockedExceptions extends Exception
{
    public function __construct(int $remainingMinutes = 0)
    {
        $message = "Temporarily locked. Try again in {$remainingMinutes} minutes.";
        parent::__construct($message);
    }
}