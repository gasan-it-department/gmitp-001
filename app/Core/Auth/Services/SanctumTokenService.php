<?php

namespace app\Core\Auth\Services;

use App\Core\Users\Infrastructure\Models\User;
use App\Core\Auth\Interfaces\TokenServiceInterface;


class SanctumTokenService implements TokenServiceInterface
{
    public function createToken(int $userId, bool $rememberMe): array
    {
        $user = new User();

        $user->exists = true;

        $user->id = $userId;

        $tokenName = 'api-token'; // A descriptive name for tokens used via API

        $expirationMinutes = $rememberMe ? 43200 : 120;

        $token = $user->createToken($tokenName);

        $token->accessToken->expires_at = now()->addMinutes($expirationMinutes);

        $token->accessToken->save();


        return [
            'token' => $token->plainTextToken,
            'expires_in' => $expirationMinutes * 60
        ];
    }
}