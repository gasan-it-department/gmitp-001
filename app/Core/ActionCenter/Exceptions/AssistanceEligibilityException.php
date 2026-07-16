<?php

namespace App\Core\ActionCenter\Exceptions;

use App\Core\ActionCenter\Dto\Beneficiary\EligibilityResult;
use App\Shared\Exceptions\Interfaces\DomainException;

/**
 * Raised when a citizen tries to file a request they are not currently eligible
 * for — an active cooldown, an in-flight request, or a one-time program already
 * consumed.
 *
 * Extends the shared App\Shared\Exceptions\Interfaces\DomainException so the
 * global renderer in bootstrap/app.php flashes the message to `error` and
 * surfaces it through FlashHandler as a toast. The wording is reused verbatim
 * from EligibilityResult::message(), so the toast the citizen sees on a blocked
 * submit matches the message on the disabled portal card.
 *
 * Enforced ONLY on the citizen self-file path. The admin walk-in flow is
 * deliberately NOT gated — an MSWD officer may file despite a cooldown for a
 * verified emergency, recorded with an override audit entry.
 */
class AssistanceEligibilityException extends DomainException
{
    public static function from(EligibilityResult $result): self
    {
        return new self($result->message());
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'ASSISTANCE_NOT_ELIGIBLE';
    }
}
