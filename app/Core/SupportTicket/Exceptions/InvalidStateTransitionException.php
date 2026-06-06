<?php

namespace App\Core\SupportTicket\Exceptions;

use Exception;

class InvalidStateTransitionException extends Exception
{
    public static function fromStatus(string $from, string $to): self
    {
        return new self("Cannot transition support ticket from [{$from}] to [{$to}].");
    }
}
