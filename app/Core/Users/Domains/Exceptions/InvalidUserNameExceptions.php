<?php

namespace App\Core\Users\Domains\Exceptions;

final class InvalidUserNameExceptions extends InvalidUserInputException
{
    public static function empty(): self
    {
        return new self('user_name', 'Username cannot be empty');
    }

    public static function tooShort(int $minLength): self
    {
        return new self('user_name', "Username must be at least {$minLength} characters long");
    }

    public static function tooLong(int $maxLength): self
    {
        return new self('user_name', "Username cannot exceed {$maxLength} characters");
    }

    public static function containsSpaces(): self
    {
        return new self('user_name', 'Username cannot contain spaces');
    }

    public static function invalidCharacters(): self
    {
        return new self('user_name', 'Username can only contain letters, numbers, and underscores');
    }

    public static function userNameAlreadyTaken(): self
    {
        return new self('user_name', 'Username is already taken');
    }
}