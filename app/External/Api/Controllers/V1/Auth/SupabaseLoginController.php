<?php

namespace App\External\Api\Controllers\V1\Auth;

use App\Core\Auth\Actions\AuthenticateSocialUserAction;
use App\Core\Auth\Dto\SocialUserDto;
use App\Core\Auth\Exceptions\AccountDeactivatedException;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class SupabaseLoginController extends Controller
{
    public function __construct(
        private AuthenticateSocialUserAction $authenticateSocialUser,
    ) {
    }

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

        $supabaseUser = $this->verifySupabaseToken($validated['access_token']);

        $email = Arr::get($supabaseUser, 'email');

        if (! is_string($email) || $email === '') {
            throw ValidationException::withMessages([
                'access_token' => ['The Supabase account does not contain an email address.'],
            ]);
        }

        $metadata = Arr::get($supabaseUser, 'user_metadata', []);
        $fullName = Arr::get($metadata, 'full_name') ?? Arr::get($metadata, 'name');
        [$firstName, $lastName] = $this->splitName($fullName);

        $user = $this->authenticateSocialUser->execute(
            new SocialUserDto(
                providerName: 'supabase',
                providerId: (string) Arr::get($supabaseUser, 'id'),
                email: $email,
                firstName: Arr::get($metadata, 'first_name') ?? $firstName,
                lastName: Arr::get($metadata, 'last_name') ?? $lastName,
                avatarUrl: Arr::get($metadata, 'avatar_url') ?? Arr::get($metadata, 'picture'),
            )
        );

        if ($user->isDeactivated()) {
            throw new AccountDeactivatedException();
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
                ],
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function verifySupabaseToken(string $accessToken): array
    {
        $supabaseUrl = config('services.supabase.url');
        $supabaseAnonKey = config('services.supabase.anon_key');

        if (! $supabaseUrl || ! $supabaseAnonKey) {
            abort(500, 'Supabase authentication is not configured.');
        }

        try {
            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'apikey' => $supabaseAnonKey,
                    'Accept' => 'application/json',
                ])
                ->get(rtrim($supabaseUrl, '/') . '/auth/v1/user');
        } catch (ConnectionException) {
            abort(503, 'Unable to connect to Supabase authentication service.');
        }

        if ($response->unauthorized() || $response->forbidden()) {
            abort(401, 'Invalid Supabase access token.');
        }

        if (! $response->successful()) {
            abort(502, 'Supabase authentication service rejected the request.');
        }

        return $response->json();
    }

    /**
     * @return array{0: string|null, 1: string|null}
     */
    private function splitName(?string $fullName): array
    {
        if (! $fullName) {
            return [null, null];
        }

        $parts = explode(' ', trim($fullName), 2);

        return [
            $parts[0] ?? null,
            $parts[1] ?? null,
        ];
    }
}
