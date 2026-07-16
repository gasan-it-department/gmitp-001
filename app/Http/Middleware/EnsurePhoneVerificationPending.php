<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneVerificationPending
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $municipal = app('current_municipality');
        if ($user->phone === null || $user->phone_verified_at !== null) {
            return redirect()->route('home', [
                'municipality' => $municipal->slug,
            ]);
        }

        return $next($request);
    }
}
