<?php

namespace App\External\Web\Controllers\UserManagement\SuperAdmin;

use App\Core\Users\UseCases\GetUserByIdUseCase;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Core\Users\Dto\UserQueryDto;
use App\Core\Users\UseCases\GetAllUsersUseCase;
use App\External\Api\Resources\User\UserResource;
use App\Core\Users\Services\PermissionOptionService;
use App\Core\Municipality\Services\GetActiveMunicipality;

class UserManagementController
{

    public function index(Request $request, GetAllUsersUseCase $getAllUsersUseCase)
    {

        $dto = UserQueryDto::fromRequest($request);

        $users = $getAllUsersUseCase->execute($dto);

        return Inertia::render('UserManagement/SuperAdmin/List/UserManagement', [

            'users' => UserResource::collection($users),

            'filters' => $request->only(['filter']),
        ]);

    }

    public function show($id, GetUserByIdUseCase $getUser)
    {

        $user = $getUser->execute($id);

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
