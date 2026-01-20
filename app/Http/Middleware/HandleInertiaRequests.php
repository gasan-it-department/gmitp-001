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

        $roleChecker = app(UserRoleCheckerService::class);

        return [
            ...parent::share($request),

            // Keep only the essential auth data
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'app_name' => config('app.name'),
            'auth' => [
                'user' => $user ? (new UserResource($user))->resolve() : null,
                'roles' => [
                    'isClient' => $user ? $roleChecker->isClient($user) : false,
                    'isAdmin' => $user ? $roleChecker->isAdmin($user) : false,
                    'isSuperAdmin' => $user ? $roleChecker->isSuperAdmin($user) : false,
                ]
            ],
        ];
    }
}
