<?php

namespace App\Core\Auth\Infrastructure\Repositories;

use App\Core\Auth\Domain\Contracts\AuthSessionRepositoryInterface;
use App\Core\Auth\Domain\Entities\AuthSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
class SanctumAuthSessionRepository implements AuthSessionRepositoryInterface
{
    public function create(AuthSession $session): AuthSession
    {
        // Implementation would integrate with Laravel Sanctum
        // This is a simplified example

        DB::table('personal_access_tokens')->insert([
            'tokenable_type' => 'App\\Models\\User',
            'tokenable_id' => $session->getUserId(),
            'name' => 'auth-token',
            'token' => hash('sha256', $session->getToken()),
            'abilities' => json_encode(['*']),
            'expires_at' => $session->getExpiresAt(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $session;
    }

    public function findByToken(string $token): ?AuthSession
    {
        $tokenData = DB::table('personal_access_tokens')
            ->where('token', hash('sha256', $token))
            ->first();

        if (!$tokenData) {
            return null;
        }

        return new AuthSession(
            token: $token,
            userId: $tokenData->tokenable_id,
            expiresAt: new \DateTimeImmutable($tokenData->expires_at),
            isRemembered: true, // Could be stored in abilities or separate column
            createdAt: new \DateTimeImmutable($tokenData->created_at)
        );
    }

    public function invalidate(string $token): void
    {
        DB::table('personal_access_tokens')
            ->where('token', hash('sha256', $token))
            ->delete();
    }

    public function invalidateAllForUser(int $userId): void
    {
        DB::table('personal_access_tokens')
            ->where('tokenable_id', $userId)
            ->delete();
    }

    public function cleanup(): void
    {
        DB::table('personal_access_tokens')
            ->where('expires_at', '<', now())
            ->delete();
    }
}
