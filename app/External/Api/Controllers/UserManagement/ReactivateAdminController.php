<?php

namespace App\External\Api\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Core\Users\UseCases\ReactivateAdminUseCase;

class ReactivateAdminController extends Controller
{
    public function __invoke(string $id, ReactivateAdminUseCase $reactivateAdminUseCase)
    {
        $reactivateAdminUseCase->execute($id);

        return redirect()
            ->route('superAdmin.show.user', $id)
            ->with('success', 'Administrator reactivated. Re-grant module permissions as needed.');
    }
}
