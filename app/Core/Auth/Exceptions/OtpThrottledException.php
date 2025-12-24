<?php

namespace App\Core\Auth\Exceptions;

use Exception;

class OtpThrottledException extends Exception
{

    public readonly int $secondsRemaining;

    public function __construct(int $secondsRemaining, string $message = '')
    {

        $this->secondsRemaining = $secondsRemaining;

        $finalMessage = $message ?: "Please wait {$secondsRemaining} seconds before requesting a new code.";

        parent::__construct($finalMessage);
    }

}