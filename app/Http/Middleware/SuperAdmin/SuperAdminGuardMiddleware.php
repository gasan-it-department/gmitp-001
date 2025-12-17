<?php

namespace App\Http\Middleware\SuperAdmin;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Users\Services\UserRoleCheckerService;

class SuperAdminGuardMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    public function __construct(
        private UserRoleCheckerService $userRoleCheckerService
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = request()->user();
        if (!$user) {
            return redirect()->route('landing');
        }

        if (!$this->userRoleCheckerService->isSuperAdmin($user)) {
            abort(403, 'Forbidden: Super Admin access only.');
        }

        return $next($request);
    }
}
