<?php

namespace App\External\Web\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\External\Web\Request\Auth\CreateUserRequest;
use Illuminate\Http\Request;
use App\Core\Users\Application\Services\CreateUserService;
use App\Core\Users\Application\Dto\CreateUserDto as Dto;

class CreateUserController extends Controller
{

    public function __construct(
        private CreateUserService $userService
    ) {
    }

    //user creation
    //check the CreateUserRequest for validation rules and if you need update for validation rules
    public function createUser(CreateUserRequest $request)
    {

        $dto = new Dto(
            user_name: $request->input('user_name'),
            phone: $request->input('phone'),
            password: $request->input('password'),
            role: $request->input('role')
        );

        $this->userService->registerUser($dto);

        return response()->json(['message' => 'User created successfully']);
    }
}
