<?php

namespace App\External\Web\Controllers\UserManagement\SuperAdmin;

use App\Core\Users\Dto\UserQueryDto;
use App\Core\Users\UseCases\GetAllUsersUseCase;
use App\External\Api\Resources\User\UserResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ListUserManagementController
{
    public function __invoke(Request $request, GetAllUsersUseCase $getAllUsersUseCase)
    {
        $users = $getAllUsersUseCase->execute(
            UserQueryDto::fromRequest($request)
        );

        $users->load(['roles', 'permissions', 'municipality']);

        return Inertia::render('UserManagement/SuperAdmin/List/UserManagement', [
            'users' => UserResource::collection($users),
            'filters' => $request->only(['filter']),
        ]);
    }
}
