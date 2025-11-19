<?php

namespace App\Core\Users\Services;

use App\Core\Users\Contracts\HasRole;
use App\Core\Users\Enums\EnumRoles as Role;

class UserRoleCheckerService
{
    public function hasRole(HasRole $user, Role $role): bool
    {

        return Role::from($user->getRole()) === $role;

    }

    public function isClient(HasRole $user): bool
    {

        return $this->hasRole($user, Role::CLIENT);

    }

    public function isAdmin(HasRole $user): bool
    {

        return $this->hasRole($user, Role::ADMIN);

    }

    public function isSuperAdmin(HasRole $user): bool
    {

        return $this->hasRole($user, Role::SUPER_ADMIN);

    }

}