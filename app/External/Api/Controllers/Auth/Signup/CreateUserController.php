<?php

namespace App\External\Api\Controllers\Auth\Signup;

use App\Http\Controllers\Controller;
use App\Core\Users\Exceptions\UserAlreadyExistExceptions;
use App\Core\Users\Dto\RegisterUserDto;
use App\Core\Users\UseCases\RegisterUserUseCase;
use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\External\Api\Request\Auth\CreateUserRequest;
use Illuminate\Validation\ValidationException;

class CreateUserController extends Controller
{
    public function __construct(
        private RegisterUserUseCase $registerUserCase,
        private CookieSessionInterface $cookieSessionService,
    ) {
    }

    /**
     * Handle the incoming user creation request.
     */
    public function __invoke(CreateUserRequest $request)
    {

        $municipality = app('current_municipality');

        $dto = RegisterUserDto::fromRequest($request);

        try {
            $user = $this->registerUserCase->execute($dto, $municipality->slug);
        } catch (UserAlreadyExistExceptions $e) {
            throw ValidationException::withMessages([
                $e->field => $e->getMessage(),
            ]);
        }

        $this->cookieSessionService->createAuthenticatedSession($user->id);

        return redirect()->route('otp.verification.page');

    }
}
