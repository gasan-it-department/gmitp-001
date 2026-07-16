<?php

namespace App\Core\Auth\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class AccountDeactivatedException extends DomainException
{
    public function __construct()
    {
        parent::__construct('This account has been deactivated. Please contact your administrator.');
    }

    public function status(): int
    {
        return 402; // Forbidden
    }

    public function errorCode(): string
    {
        return 'AUTH_ACCOUNT_DEACTIVATED';
    }
}
