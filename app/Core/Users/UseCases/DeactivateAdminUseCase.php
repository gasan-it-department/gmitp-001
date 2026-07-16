<?php

declare(strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Users\Models\User;

class DeactivateAdminUseCase
{
    public function execute(string $id): User
    {
        // Direct model access (no repository) per design.
        $admin = User::findOrFail($id);

        // Revoke all module access, then mark the account deactivated. Login is
        // blocked while deactivated_at is set; the role is kept as a record.
        $admin->syncPermissions([]);

        $admin->deactivated_at = now();

        $admin->save();

        return $admin;
    }
}
