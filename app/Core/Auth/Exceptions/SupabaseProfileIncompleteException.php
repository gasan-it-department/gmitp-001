<?php

namespace App\Core\Auth\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class SupabaseProfileIncompleteException extends DomainException
{
    public function __construct()
    {
        parent::__construct('The Supabase account must contain a first name and last name before it can be created in Laravel.');
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'AUTH_SUPABASE_PROFILE_INCOMPLETE';
    }
}
