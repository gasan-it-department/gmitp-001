<?php

namespace App\Core\Auth\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class InvalidCredentialsExceptions extends DomainException
{
    protected $message = 'The provided credentials are incorrect.';

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'AUTH_INVALID_CREDENTIALS';
    }
}
