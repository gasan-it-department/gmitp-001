<?php

namespace App\Http\Middleware\External;

use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifyAgaEdgeSecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredSecret = (string) config('services.supabase.edge_secret');

        $providedSecret = (string) $request->header('x-laravel-secret', '');

        if (! $request->wantsJson()) {
            return new JsonResponse([
                'message' => 'The Accept header must allow application/json.',
            ], 406);
        }

        if (! $request->isJson()) {
            return new JsonResponse([
                'message' => 'The Content-Type header must be application/json.',
            ], 415);
        }

        $hasValidSharedSecret = $configuredSecret !== ''
            && $providedSecret !== ''
            && hash_equals($configuredSecret, $providedSecret);

        if (! $hasValidSharedSecret && ! $this->hasValidSupabaseIdentity($request)) {
            return new JsonResponse([
                'message' => 'Unauthorized.',
            ], 401);
        }

        return $next($request);
    }

    /**
     * Allow the Edge Function to authenticate with the freshly reauthenticated
     * user's Supabase JWT when a legacy deployment has no shared secret yet.
     * The verified JWT subject must exactly match the account being deleted,
     * so a caller can never unlink another Laravel account.
     */
    private function hasValidSupabaseIdentity(Request $request): bool
    {
        $accessToken = $request->bearerToken();
        $requestedUserId = $request->input('supabase_user_id');
        $supabaseUrl = (string) config('services.supabase.url');
        $supabaseAnonKey = (string) config('services.supabase.anon_key');

        if (
            ! is_string($accessToken) || $accessToken === ''
            || ! is_string($requestedUserId) || $requestedUserId === ''
            || $supabaseUrl === '' || $supabaseAnonKey === ''
        ) {
            return false;
        }

        try {
            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'apikey' => $supabaseAnonKey,
                    'Accept' => 'application/json',
                ])
                ->get(rtrim($supabaseUrl, '/').'/auth/v1/user');
        } catch (ConnectionException) {
            return false;
        }

        if (! $response->successful()) {
            return false;
        }

        $verifiedUserId = $response->json('id');

        return is_string($verifiedUserId)
            && hash_equals($requestedUserId, $verifiedUserId);
    }
}
