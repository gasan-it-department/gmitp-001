<?php

namespace App\Core\Auth\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class SupabaseIdentityConflictException extends DomainException
{
    public function __construct(string $message = 'This Supabase identity is already connected to another account.')
    {
        parent::__construct($message);
    }

    public function status(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return 'AUTH_SUPABASE_IDENTITY_CONFLICT';
    }
}
