<?php

namespace App\Core\Auth\Interfaces;

interface CookieSessionInterface
{
    public function createAuthenticatedSession(int $userId, bool $rememberMe = false): array;
    public function regenerateSession(): void;
    public function destroySession(): void;
    public function isAuthenticated(): bool;
}