<?php

namespace App\Core\Auth\Services;

use App\Core\Users\Services\UserRoleCheckerService;

class LoginRedirectionService
{
    public function __construct(
        protected UserRoleCheckerService $roleChecker,
    ) {
    }
    public function redirectUser(object $user, string $slug): string
    {

        if (!is_null($user->phone) && is_null($user->phone_verified_at)) {
            return route('otp.verification.page', ['municipality' => $slug]);

        }
        return route('home', ['municipality' => $slug]);
    }
}
