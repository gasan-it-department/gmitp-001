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
        return match (true) {
            $this->roleChecker->isClient($user) => route('/'),
            $this->roleChecker->isAdmin($user) => route('admin.dashboard', ['municipality' => $slug]),
            $this->roleChecker->isSuperAdmin($user) => route('superAdmin.dashboard'),
        };
    }
}