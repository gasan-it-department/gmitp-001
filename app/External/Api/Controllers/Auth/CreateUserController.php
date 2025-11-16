<?php

namespace App\External\Api\Controllers\Auth;

use App\Core\Users\Dto\RegisterUserDto;
use App\Core\Users\Repository\UserRepository;
use App\Core\Users\UseCases\RegisterUserUseCase;
use App\Http\Controllers\Controller;
use App\External\Api\Request\Auth\CreateUserRequest;
use Illuminate\Http\Request;

use App\Core\Users\Domains\Exceptions\InvalidUserInputException;


class CreateUserController extends Controller
{

    public function __construct(
        private RegisterUserUseCase $registerUserCase,
    ) {
    }

    //user creation
    //check the CreateUserRequest for validation rules and if you need update for validation rules
    public function createUser(CreateUserRequest $request)
    {
        try {
            $validated = $request->validated();

            $dto = new RegisterUserDto(
                firstName: $validated['first_name'],
                middleName: $validated['middle_name'],
                lastName: $validated['last_name'],
                userName: $validated['user_name'],
                phone: $validated['user_name'],
                password: $validated['password'],
            );

            $this->registerUserCase->execute($dto);

            return response()->json(['message' => 'User created successfully']);

        } catch (InvalidUserInputException $event) {

            return response()->json(

                [
                    'message' => 'failed registry',
                    'errors' => [
                        $event->getField() => [$event->getMessage()]
                    ]
                ],
                200
            );
        }
    }
}
