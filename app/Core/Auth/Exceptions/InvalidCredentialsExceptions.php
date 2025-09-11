<?php

namespace App\Core\Auth\Exceptions;

use Exception;
class InvalidCredentialsExceptions extends Exception
{
    protected $message = 'The provided credentials are incorrect.';
}