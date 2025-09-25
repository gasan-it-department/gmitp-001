<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Users\Infrastructure\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Core\Users\Application\Services\UserRoleCheckerService;

class RoleCheckRedirect
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    public function __construct(
        protected UserRoleCheckerService $roleCheckerService,
    ) {
    }
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // If the request already asked for JSON (AJAX/Inertia), we may return JSON instead
        if ($user = $request->user()) {
            $redirectTo = match (true) {
                $this->roleCheckerService->isAdmin($user) => '/admin/dashboard',
                $this->roleCheckerService->isSuperAdmin($user) => '/super-admin/dashboard',
                $this->roleCheckerService->isClient($user) => url()->previous(),

                default => '/',
            };

            // 👇 Detect if it's an AJAX/Axios request
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'redirect_to' => $redirectTo,
                ]);
            }

            // 👇 Normal request (browser form POST)
            return redirect($redirectTo);
        }
        // Otherwise return whatever the controller returned
        return $response;
    }
}
