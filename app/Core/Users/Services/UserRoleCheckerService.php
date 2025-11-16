<?php

namespace App\Core\Users\Services;

use App\Core\Users\Enums\EnumRoles as Role;
use App\Core\Users\Models\User;

class UserRoleCheckerService
{
    public function hasRole(User $user, Role $role): bool
    {
        if (!$user) {
            return false;
        }
        return $user->role === $role;
    }
    public function isClient(User $user): bool
    {
        return Role::from($user->role) === Role::CLIENT;
    }

    public function isAdmin(User $user): bool
    {
        return Role::from($user->role) === Role::ADMIN;

    }

    public function isSuperAdmin(User $user): bool
    {
        return Role::from($user->role) === Role::SUPER_ADMIN;
    }

}