<?php

namespace App\Core\Auth\Infrastructure\Repositories;

use App\Core\Auth\Domain\Contracts\LoginAttemptRepositoryInterface;
use App\Core\Auth\Domain\Entities\LoginAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CacheLoginAttemptRepository implements LoginAttemptRepositoryInterface
{

    private const ATTEMPTS_PREFIX = 'login_attempts:';
    private const LOCK_PREFIX = 'account_locked:';

    public function store(LoginAttempt $attempt): void
    {
        if (!$attempt->wasSuccessful()) {
            $key = self::ATTEMPTS_PREFIX . $attempt->getUsername();
            $attempts = Cache::get($key, []);
            $attempts[] = $attempt->getAttemptedAt()->getTimestamp();
            Cache::put($key, $attempts, now()->addMinutes(30));
        }


        // Store for audit in DB (optional)
        // DB::table('login_attempts')->insert([
        //     'identifier' => $attempt->getUsername(),
        //     'ip_address' => $attempt->getIpAddress(),
        //     'attempted_at' => $attempt->getAttemptedAt(),
        //     'successful' => $attempt->wasSuccessful(),
        //     'failure_reason' => $attempt->getFailureReason(),
        // ]);
    }

    public function getFailedAttemptCount(string $user_name, int $within_minutes = 15): int
    {
        $key = self::ATTEMPTS_PREFIX . $user_name;
        $attempts = Cache::get($key, []);
        $cutoff = time() - ($within_minutes * 60);

        return count(array_filter($attempts, fn($timestamp) => $timestamp > $cutoff));
    }

    public function getFailedAttemptsCountByIp(string $ipAddress, int $withinMinutes = 15): int
    {
        $key = self::ATTEMPTS_PREFIX . 'ip:' . $ipAddress;
        $attempts = Cache::get($key, []);
        $cutoff = time() - ($withinMinutes * 60);

        return count(array_filter($attempts, fn($timestamp) => $timestamp > $cutoff));
    }

    public function clearAttempts(string $user_name): void
    {
        Cache::forget(self::ATTEMPTS_PREFIX . $user_name);
    }

    public function isLocked(string $user_name): bool
    {
        return Cache::has(self::LOCK_PREFIX . $user_name);
    }

    public function lockAccount(string $user_name, int $lockDurationMinutes = 15): void
    {
        Cache::put(
            self::LOCK_PREFIX . $user_name,
            time(),
            now()->addMinutes($lockDurationMinutes)
        );
    }

    public function unlock(string $user_name): void
    {
        Cache::forget(self::LOCK_PREFIX . $user_name);
    }
}
