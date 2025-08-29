<?php

namespace App\Core\Users\Domains\Exceptions;


final class InvalidPasswordExceptions extends InvalidUserInputException
{
    public static function tooShort(int $minLength): self
    {
        return new self('password', "Password must be at least {$minLength} characters long");
    }

    public static function missingUppercase(): self
    {
        return new self('password', 'Password must contain at least one uppercase letter');
    }

    public static function missingNumber(): self
    {
        return new self('password', 'Password must contain at least one number');
    }

    public static function containsSpaces(): self
    {
        return new self('password', 'Password cannot contain spaces');
    }

    public static function empty(): self
    {
        return new self('password', 'Password cannot be empty');
    }

}