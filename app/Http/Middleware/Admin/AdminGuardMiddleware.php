<?php

namespace App\Http\Middleware\Admin;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Core\Users\Services\UserRoleCheckerService;

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

        $currentMunicipality = app('current_municipality');

        if (!$user) {
            // abort(401, 'Unauthorized');
            return redirect()->route('landing');
        }

        if (!$this->userRoleCkerService->isAdmin($user)) {
            return redirect()->route('landing');
        }

        if ($user->municipal_id !== $currentMunicipality->id) {

            abort(403, 'You do not have jurisdiction over this municipality.');

            $user->load('municipality');
            // return redirect()->to(
            //     route('admin.dashboard', ['municipality' => $user->municipality->slug])
            // )->with('error', 'Redirected to your assigned jurisdiction.');

        }


        return $next($request);
    }
}
