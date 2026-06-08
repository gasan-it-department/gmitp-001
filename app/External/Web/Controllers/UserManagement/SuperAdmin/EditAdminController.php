<?php

namespace App\External\Web\Controllers\UserManagement\SuperAdmin;

use Inertia\Inertia;
use App\Core\Users\UseCases\GetUserByIdUseCase;
use App\External\Api\Resources\User\UserResource;
use App\Core\Users\Services\PermissionOptionService;
use App\Core\Municipality\Services\GetActiveMunicipality;

class EditAdminController
{
    public function __invoke(
        string $id,
        GetUserByIdUseCase $getUser,
        PermissionOptionService $permissionOptionService,
        GetActiveMunicipality $getActiveMunicipality,
    ) {

        $user = $getUser->execute($id);

        // Load relations so UserResource can expose the admin's current
        // permissions (for prefill) and assigned municipality.
        $user->load(['permissions', 'municipality']);

        return Inertia::render('UserManagement/SuperAdmin/Edit/EditAdmin', [

            'user' => new UserResource($user),

            'data' => [
                'permissions' => $permissionOptionService->getPermissionOptions(),
                'municipality' => $getActiveMunicipality->execute(),
            ],

        ]);

    }
}
