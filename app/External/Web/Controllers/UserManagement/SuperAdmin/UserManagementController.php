<?php

namespace App\External\Web\Controllers\UserManagement\SuperAdmin;

use Inertia\Inertia;
use App\Core\Users\UseCases\GetAllUsersUseCase;
use App\External\Api\Resources\User\UserResource;
use App\Core\Users\Services\PermissionOptionService;
use App\Core\Municipality\Services\GetActiveMunicipality;

class UserManagementController
{

    public function index(GetAllUsersUseCase $getAllUsersUseCase)
    {

        $users = $getAllUsersUseCase->execute();

        return Inertia::render('UserManagement/SuperAdmin/List/UserManagement', [

            'users' => UserResource::collection($users)

        ]);

    }

    public function show($id)
    {
        $user = 34;

        Inertia::render('UserManagement/SuperAdmin/Details/UserDetails', [

            'user' => $user

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
