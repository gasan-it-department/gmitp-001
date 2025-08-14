<?php

namespace App\Core\Users\Application\Exceptions;
use DomainException;


final class UserAlreadyExistExceptions extends DomainException
{
    public static function withUserName(string $userName): self
    {
        return new self("User with username '{$userName}' already exists.");
    }

    public static function withPhone(string $phone): self
    {
        return new self("User with phone number '{$phone}' already exists.");
    }
}