<?php

namespace App\Http\Middleware;

use App\External\Api\Resources\User\UserResource;
use Inertia\Middleware;
use Illuminate\Http\Request;
use App\Core\Users\Services\UserRoleCheckerService;
class HandleInertiaRequests extends Middleware
{
    /**
     * The root template loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * Keep it minimal so we don’t send unnecessary data.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = request()->user();

        // Eager-load lightweight relations once here so they are available
        // on every page via usePage().props.auth — no per-page Auth:: calls needed.
        if ($user) {
            $user->load('socialAccounts');
        }

        $roleChecker = app(UserRoleCheckerService::class);

        return [
            ...parent::share($request),

            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'app_name' => config('app.name'),
            'auth' => [
                'user' => $user ? (new UserResource($user))->resolve() : null,
                'roles' => [
                    'isClient'    => $user ? $roleChecker->isClient($user) : false,
                    'isAdmin'     => $user ? $roleChecker->isAdmin($user) : false,
                    'isSuperAdmin' => $user ? $roleChecker->isSuperAdmin($user) : false,
                ],
                // Permission names the admin holds — drives `{module}.access`
                // menu visibility in the sidebar. super_admin carries none
                // explicitly (they bypass via Gate), so gate menus on
                // `roles.isSuperAdmin || permissions.includes('x.access')`.
                'permissions' => $user ? $user->getAllPermissions()->pluck('name')->all() : [],
            ],
        ];
    }
}
