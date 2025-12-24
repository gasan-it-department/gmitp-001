<?php

namespace App\Core\Users\Exceptions;

use Exception;


final class UserAlreadyExistExceptions extends Exception
{

    public readonly string $field;

    public function __construct(string $message, string $field)
    {

        parent::__construct($message);
        $this->field = $field;

    }

    public static function withUserName(string $userName): self
    {
        return new self("This username '{$userName}' is already taken.", 'user_name');
    }

    public static function withPhone(string $phone): self
    {

        return new self("This '{$phone}' is already registered.", 'phone');

    }
}