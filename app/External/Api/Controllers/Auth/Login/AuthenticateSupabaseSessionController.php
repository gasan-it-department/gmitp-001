<?php

namespace App\External\Api\Controllers\Auth\Login;

use App\Core\Auth\Services\SupabaseAccessTokenVerifier;
use App\Core\Auth\UseCase\LoginWithSupabase;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthenticateSupabaseSessionController extends Controller
{
    public function __construct(
        private SupabaseAccessTokenVerifier $supabaseAccessTokenVerifier,
        private LoginWithSupabase $loginWithSupabase,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'access_token' => ['required', 'string'],
            'remember_me' => ['sometimes', 'boolean'],
        ]);

        $municipality = app('current_municipality');
        $result = $this->loginWithSupabase->execute(
            $this->supabaseAccessTokenVerifier->verify($validated['access_token']),
            $municipality->slug,
            $request->boolean('remember_me'),
        );

        return response()->json([
            'data' => [
                'redirect_url' => $result->redirect,
                'user' => [
                    'id' => $result->user->id,
                    'first_name' => $result->user->first_name,
                    'last_name' => $result->user->last_name,
                    'email' => $result->user->email,
                    'phone' => $result->user->phone,
                ],
            ],
        ]);
    }
}
