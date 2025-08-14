<?php

namespace App\Core\Users\Domains\Exceptions;

use DomainException;
final class InvalidUserNameExceptions extends DomainException
{
    public static function empty(): self
    {
        return new self('Username cannot be empty');
    }

    public static function tooShort(int $minLength): self
    {
        return new self("Username must be at least {$minLength} characters long");
    }

    public static function tooLong(int $maxLength): self
    {
        return new self("Username cannot exceed {$maxLength} characters");
    }

    public static function containsSpaces(): self
    {
        return new self('Username cannot contain spaces');
    }

    public static function invalidCharacters(): self
    {
        return new self('Username can only contain letters, numbers, and underscores');
    }
}