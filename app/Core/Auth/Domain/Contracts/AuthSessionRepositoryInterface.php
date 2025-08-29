<?php

namespace App\Core\Auth\Domain\Contracts;

use App\Core\Auth\Domain\Entities\AuthSession;
interface AuthSessionRepositoryInterface
{
    public function create(AuthSession $session): AuthSession;
    public function findByToken(string $token): ?AuthSession;
    public function invalidate(string $token): void;
    public function invalidateAllForUser(int $userId): void;
    public function cleanup(): void;// Remove expired sessions
}