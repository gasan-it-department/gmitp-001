<?php

namespace App\Core\CommunityReport\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class ReportLimitExceededException extends DomainException
{
    public static function forDailyLimit(int $limit): self
    {
        return new self("Masyado na pong marami ang inyong ulat para sa araw na ito. Ang limitasyon ay {$limit} ulat lamang kada araw.");
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'REPORT_LIMIT_EXCEEDED';
    }
}
