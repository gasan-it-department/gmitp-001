<?php

namespace App\Core\Users\Services;

use App\Core\Users\Enums\EnumRoles as Role;
use App\Core\Users\Models\User;

class UserRoleCheckerService
{
    public function hasRole($user, Role $role): bool
    {

        return $user->hasRole($role->value);

    }

    public function isClient($user): bool
    {

        return $this->hasRole($user, Role::CLIENT);

    }

    public function isAdmin($user): bool
    {

        return $this->hasRole($user, Role::ADMIN);

    }

    public function isSuperAdmin($user): bool
    {

        return $this->hasRole($user, Role::SUPER_ADMIN);

    }

}