<?php

namespace App\Core\SupportTicket\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class TicketLimitExceededException extends DomainException
{
    public static function forDailyLimit(int $limit): self
    {
        return new self("You have reached the maximum number of support tickets for today. The limit is {$limit} tickets per day.");
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'TICKET_LIMIT_EXCEEDED';
    }
}
