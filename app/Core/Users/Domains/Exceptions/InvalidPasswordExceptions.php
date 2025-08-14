<?php

namespace App\Core\Users\Domains\Exceptions;

use DomainException;

final class InvalidPasswordExceptions extends DomainException
{
    public static function tooShort(int $minLength): self
    {
        return new self("Password must be at least {$minLength} characters long");
    }

    public static function missingUppercase(): self
    {
        return new self('Password must contain at least one uppercase letter');
    }

    public static function missingNumber(): self
    {
        return new self('Password must contain at least one number');
    }

    public static function containsSpaces(): self
    {
        return new self('Password cannot contain spaces');
    }

    public static function empty(): self
    {
        return new self('Password cannot be empty');
    }
}