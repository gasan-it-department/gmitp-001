<?php

namespace App\Core\Auth\Domain\Contracts;
use App\Core\Auth\Domain\Entities\LoginAttempt;
interface LoginAttemptRepositoryInterface
{
    public function store(LoginAttempt $attempt): void;
    public function getFailedAttemptCount(string $user_name, int $within_minutes = 15): int;
    public function getFailedAttemptsCountByIp(string $ipAddress, int $withinMinutes = 15): int;
    public function clearAttempts(string $user_name): void;
    public function isLocked(string $user_name): bool;
    public function lockAccount(string $user_name, int $lockDurationMinutes = 15): void;
    public function unlock(string $user_name): void;
}