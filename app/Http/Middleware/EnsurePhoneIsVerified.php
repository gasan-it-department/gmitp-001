<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneIsVerified
{

    public function handle(Request $request, Closure $next): Response
    {

        $user = $request->user();

        // 1. Safety check: Ensure the user actually exists before checking properties
        if (!$user) {
            return $next($request);
        }

        // 2. The Logic: If they HAVE a phone, but it is NOT verified yet
        if ($user->phone !== null && is_null($user->phone_verified_at)) {
            // Optional: Prevent redirect loop if they are already on the OTP page
            if (!$request->routeIs('otp.verification.page')) {
                return redirect()->route('otp.verification.page', [
                    'municipality' => $request->route('municipality'),
                ]);
            }
        }


        return $next($request);
    }
}
