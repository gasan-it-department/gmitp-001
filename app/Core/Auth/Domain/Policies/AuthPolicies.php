<?php

namespace App\Core\Auth\Domain\policies;

class AuthPolicies
{
    private const MAX_LOGIN_ATTEMPTS = 10;
    private const LOCK_DURATION_MINUTES = 10;
    private const REMEMBER_DURATION_DAYS = 10;
    private const SHORT_SESSION_DURATION_MINUTES = 120;

    public static function getSessionDuration(bool $remeber_me): int
    {
        return $remeber_me
            ? self::REMEMBER_DURATION_DAYS * 24 * 60
            : self::SHORT_SESSION_DURATION_MINUTES;
    }
    public static function shouldLockAccount(int $attemptsCount): bool
    {
        return $attemptsCount >= self::MAX_LOGIN_ATTEMPTS;
    }
}