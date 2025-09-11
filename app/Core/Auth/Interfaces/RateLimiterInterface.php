<?php

namespace App\Core\Auth\Interfaces;

interface RateLimiterInterface
{
    public function tooManyAttempts(string $key, int $maxAttempts): bool;

    public function hit(string $key, int $decaySeconds = 60): int;

    public function clear(string $key): void;

    public function availableIn(string $key): int;

}