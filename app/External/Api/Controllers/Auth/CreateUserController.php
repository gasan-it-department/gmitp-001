<?php

namespace App\External\Api\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\External\Api\Request\Auth\CreateUserRequest;
use Illuminate\Http\Request;
use App\Core\Users\Application\Services\CreateUserService;
use App\Core\Users\Application\Dto\CreateUserDto as Dto;
use App\Core\Users\Domains\Exceptions\InvalidUserInputException;


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
        try {
            $dto = new Dto(
                first_name: $request->input('first_name'),
                middle_name: $request->input('middle_name'),
                last_name: $request->input('last_name'),
                user_name: $request->input('user_name'),
                phone: $request->input('phone'),
                password: $request->input('password'),
                role: $request->input('role')
            );

            $this->userService->create($dto);

            return response()->json(['message' => 'User created successfully']);
        } catch (InvalidUserInputException $event) {
            return response()->json(
                [
                    'errors' => [
                        $event->getField() => [$event->getMessage()]
                    ]
                ],
                422
            );
        }
    }
}
