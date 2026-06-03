<?php

namespace App\Core\CommunityReport\Exceptions;

use Exception;

class InvalidStateTransitionException extends Exception
{
    public static function fromStatus(string $from, string $to): self
    {
        return new self("Cannot transition community report from [{$from}] to [{$to}].");
    }
}
