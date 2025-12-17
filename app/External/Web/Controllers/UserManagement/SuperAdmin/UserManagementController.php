<?php

namespace App\External\Web\Controllers\UserManagement\SuperAdmin;

use App\Core\Users\UseCases\GetAllUsersUseCase;
use App\External\Api\Resources\User\UserResource;
use Inertia\Inertia;

class UserManagementController
{

    public function index(GetAllUsersUseCase $getAllUsersUseCase)
    {

        $users = $getAllUsersUseCase->execute();

        return Inertia::render('UserManagement/SuperAdmin/UserManagement', [

            'users' => UserResource::collection($users)

        ]);

    }

}
