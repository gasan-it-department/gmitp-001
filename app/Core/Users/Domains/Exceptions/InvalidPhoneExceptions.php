<?php

namespace App\Core\Users\Domains\Exceptions;

final class InvalidPhoneExceptions extends InvalidUserInputException
{
    public static function empty(): self
    {
        return new self('phone', 'Phone number cannot be empty');
    }

    public static function invalidFormat(): self
    {
        return new self('phone', 'Phone number contains invalid characters');
    }

    public static function invalidLength(): self
    {
        return new self('phone', 'Phone number must be between 10 and 15 digits');
    }

    public static function phoneAlreadyTaken(): self
    {
        return new self('phone', 'Phone number already taken');
    }
}

