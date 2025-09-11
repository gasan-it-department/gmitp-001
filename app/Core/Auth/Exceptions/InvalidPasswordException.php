<?php

namespace App\Core\Auth\Exceptions;
use Exception;
class InvalidPasswordException extends Exception
{
    protected $message = 'The provided password is incorrect.';
}