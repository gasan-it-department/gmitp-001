<?php

namespace App\External\Api\Controllers\V1\Auth;

use App\Core\Auth\Actions\AuthenticateSupabaseUserAction;
use App\Core\Auth\Exceptions\AccountDeactivatedException;
use App\Core\Auth\Services\SupabaseAccessTokenVerifier;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupabaseLoginController extends Controller
{
    public function __construct(
        private SupabaseAccessTokenVerifier $supabaseAccessTokenVerifier,
        private AuthenticateSupabaseUserAction $authenticateSupabaseUser,
    ) {}

    /**
     * Exchanges a Supabase Auth access token for a Laravel Sanctum token.
     *
     * This is intended for external apps, like the AGA Flutter app, where the
     * user is already authenticated by Supabase instead of this Laravel app.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'access_token' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $this->authenticateSupabaseUser->execute(
            $this->supabaseAccessTokenVerifier->verify($validated['access_token'])
        );

        if ($user->isDeactivated()) {
            throw new AccountDeactivatedException;
        }

        $token = $user->createToken(
            $validated['device_name'] ?? 'aga-mobile-app'
        )->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
            ],
        ]);
    }
}
