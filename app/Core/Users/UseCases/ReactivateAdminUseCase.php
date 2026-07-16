<?php

declare(strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Users\Models\User;

class ReactivateAdminUseCase
{
    public function execute(string $id): User
    {
        // Direct model access (no repository) per design.
        $admin = User::findOrFail($id);

        // Clearing the timestamp re-enables login. Module permissions were
        // revoked on deactivation and must be re-granted via Edit Admin.
        $admin->deactivated_at = null;

        $admin->save();

        return $admin;
    }
}
