<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneIsVerified
{

    public function handle(Request $request, Closure $next): Response
    {

        $user = request()->user();

        if (!$user) {
            return redirect()->route('landing');
        }

        if (is_null($user->phone_verified_at)) {

            return redirect()->route('otp.verification.page');

        }

        return $next($request);
    }
}
