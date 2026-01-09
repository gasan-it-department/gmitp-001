<?php

namespace App\External\Api\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Core\Users\Dto\RegisterUserDto;
use App\Core\Users\UseCases\RegisterUserUseCase;
use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\External\Api\Request\Auth\CreateUserRequest;
use App\Core\Users\Exceptions\UserAlreadyExistExceptions;


class CreateUserController extends Controller
{
    public function __construct(
        private RegisterUserUseCase $registerUserCase,
        private CookieSessionInterface $cookieSessionService,

    ) {
    }

    //user creation
    //check the CreateUserRequest for validation rules and if you need update for validation rules
    public function createUser(CreateUserRequest $request)
    {
        try {
            $municipality = app('current_municipality');

            $validated = $request->validated();

            $dto = new RegisterUserDto(
                firstName: $validated['first_name'],
                middleName: $validated['middle_name'],
                lastName: $validated['last_name'],
                userName: $validated['user_name'],
                phone: $validated['phone'],
                password: $validated['password'],
            );

            $user = $this->registerUserCase->execute($dto, $municipality->slug);

            $this->cookieSessionService->createAuthenticatedSession($user->id);

            return redirect()->route('otp.verification.page');

        } catch (UserAlreadyExistExceptions $event) {

            return back()->withErrors([

                $event->field => $event->getMessage()

            ]);

        }
    }

    public function updateContactInfo()
    {

        $user = auth()->user();



    }
}
