<?php

namespace App\Http\Middleware\Admin;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Users\Application\Services\UserRoleCheckerService;

class AdminGuardMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    public function __construct(
        protected UserRoleCheckerService $userRoleCkerService,
    ) {
    }
    public function handle(Request $request, Closure $next): Response
    {

        $user = request()->user();
        if (!$user) {
            // abort(401, 'Unauthorized');
            return redirect()->route('landingPage.show');
        }

        if (!$this->userRoleCkerService->isAdmin($user)) {
            abort(403, 'Forbidden: Admin access only.');
        }

        return $next($request);
    }
}
