<?php

namespace App\Core\Auth\Exceptions;

use Exception;

class InvalidOtpExceptions extends Exception
{

    public function __construct(

    ) {

        parent::__construct("The verification code you entered is invalid or has expired.");
    }

    public static function create()
    {

        return new self();

    }

}