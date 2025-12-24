<?php

namespace App\Core\Auth\Services;

use App\Core\Users\Services\UserRoleCheckerService;

class LoginRedirectionService
{
    public function __construct(
        protected UserRoleCheckerService $roleChecker,
    ) {
    }
    public function redirectUser(object $user, string $slug)
    {

        if (is_null($user->phone_verified_at)) {

            return route('otp.verification.page');

        }

    }
}