<?php

namespace App\Core\Auth\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class InvalidPasswordException extends DomainException
{
    protected $message = 'The provided password is incorrect.';

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'AUTH_INVALID_PASSWORD';
    }
}
