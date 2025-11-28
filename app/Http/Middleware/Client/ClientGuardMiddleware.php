<?php

namespace App\Http\Middleware\Client;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Users\Services\UserRoleCheckerService;


class ClientGuardMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function __construct(
        private UserRoleCheckerService $userRoleCheckerService,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = request()->user();

        if (!$user) {
            abort(401, 'Unauthorized');
        }


        return $next($request);
    }
}
