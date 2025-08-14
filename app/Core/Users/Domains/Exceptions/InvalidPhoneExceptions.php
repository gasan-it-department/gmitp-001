<?php

namespace App\Core\Users\Domains\Exceptions;

use DomainException;

final class InvalidPhoneExceptions extends DomainException
{
    public static function empty(): self
    {
        return new self('Phone number cannot be empty');
    }

    public static function invalidFormat(): self
    {
        return new self('Phone number contains invalid characters');
    }

    public static function invalidLength(): self
    {
        return new self('Phone number must be between 10 and 15 digits');
    }
}

