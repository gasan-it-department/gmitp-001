<?php

namespace App\External\Web\Controllers\UserManagement\SuperAdmin;

use App\Core\Users\UseCases\GetUserByIdUseCase;
use Inertia\Inertia;
use App\External\Api\Resources\User\UserResource;
use App\Core\Users\Services\PermissionOptionService;
use App\Core\Municipality\Services\GetActiveMunicipality;

class UserManagementController
{

    public function show($id, GetUserByIdUseCase $getUser)
    {

        $user = $getUser->execute($id);

        $user->load(['socialAccounts', 'roles', 'permissions']);

        return Inertia::render('UserManagement/SuperAdmin/Details/UserDetails', [

            'user' => new UserResource($user),

        ]);

    }

    public function register(PermissionOptionService $permissionOptionService, GetActiveMunicipality $getActiveMunicipality)
    {

        $permissions = $permissionOptionService->getPermissionOptions();

        $municipality = $getActiveMunicipality->execute();

        return Inertia::render('UserManagement/SuperAdmin/UserRegistry/UserRegistry', [

            'data' => [
                'permissions' => $permissions,
                'municipality' => $municipality
            ]

        ]);

    }

}
