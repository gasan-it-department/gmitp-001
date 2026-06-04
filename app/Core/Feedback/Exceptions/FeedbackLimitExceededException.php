<?php

namespace App\Core\Feedback\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class FeedbackLimitExceededException extends DomainException
{
    public static function forDailyLimit(int $limit): self
    {
        return new self("Masyado na pong marami ang inyong feedback para sa araw na ito. Ang limitasyon ay {$limit} feedback lamang kada araw.");
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'FEEDBACK_LIMIT_EXCEEDED';
    }
}
