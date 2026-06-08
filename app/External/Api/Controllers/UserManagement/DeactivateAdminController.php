<?php

namespace App\External\Api\Controllers\UserManagement;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Users\Models\User;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\UseCases\DeactivateAdminUseCase;

class DeactivateAdminController extends Controller
{
    public function __invoke(Request $request, string $id, DeactivateAdminUseCase $deactivateAdminUseCase)
    {
        $target = User::findOrFail($id);

        // Safety rails: never deactivate yourself or another super admin.
        if ($request->user()?->id === $target->id) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        if ($target->hasRole(EnumRoles::SUPER_ADMIN->value)) {
            return back()->with('error', 'Super admin accounts cannot be deactivated.');
        }

        $deactivateAdminUseCase->execute($id);

        return redirect()
            ->route('superAdmin.show.user', $id)
            ->with('success', 'Administrator deactivated. All access has been revoked.');
    }
}
