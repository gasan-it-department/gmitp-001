<?php

namespace App\Http\Middleware\External;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyAgaEdgeSecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredSecret = (string) config('services.supabase.edge_secret');

        if ($configuredSecret === '') {
            return new JsonResponse([
                'message' => 'AGA integration authentication is not configured.',
            ], 503);
        }

        $providedSecret = (string) $request->header('x-laravel-secret', '');

        if ($providedSecret === '' || ! hash_equals($configuredSecret, $providedSecret)) {
            return new JsonResponse([
                'message' => 'Unauthorized.',
            ], 401);
        }

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

        return $next($request);
    }
}
