<?php

namespace App\Core\Auth\Domain\Policies;

class AccountLockoutPolicy
{
    private const MAX_FAILED_ATTEMPTS = 5;
    private const LOCKOUT_DURATION_MINUTES = 1;
    private const ATTEMPT_WINDOW_MINUTES = 60;

    public function shouldLockAccount(int $failedAttempts): bool
    {
        return $failedAttempts >= self::MAX_FAILED_ATTEMPTS;
    }

    public function getLockDurationMinutes(): int
    {
        return self::LOCKOUT_DURATION_MINUTES; // Convert minutes to seconds
    }
    public function getAttemptWindowMinutes(): int
    {
        return self::ATTEMPT_WINDOW_MINUTES;
    }

    public function getMaxAttempts(): int
    {
        return self::MAX_FAILED_ATTEMPTS;
    }
}