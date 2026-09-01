<?php

namespace App\Core\Auth\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class InvalidSupabaseIdentityException extends DomainException
{
    public function __construct(string $message)
    {
        parent::__construct($message);
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'AUTH_SUPABASE_IDENTITY_INVALID';
    }
}
