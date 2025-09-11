<?php

namespace App\Core\Auth\Services;

use App\Core\Auth\Interfaces\RateLimiterInterface;

use Illuminate\Support\Facades\RateLimiter;

class LaravelRateLimiter implements RateLimiterInterface
{

    public function __construct(int $maxAttempts = 5, int $decayMinutes = 2)
    {
        $this->maxAttempts = $maxAttempts;
        $this->decayMinutes = $decayMinutes;
    }
    public function tooManyAttempts(string $key, int $maxAttempts): bool
    {
        return RateLimiter::tooManyAttempts($key, $maxAttempts);
    }

    public function hit(string $key, int $decayMinutes = 1): int
    {
        return RateLimiter::hit($key, $decayMinutes * 60); //convert to seconds
    }

    public function availableIn(string $key): int
    {
        return RateLimiter::availableIn($key);
    }

    public function clear(string $key): void
    {
        RateLimiter::clear($key);
    }
}