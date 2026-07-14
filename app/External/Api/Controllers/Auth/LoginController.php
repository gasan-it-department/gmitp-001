<?php

namespace App\External\Api\Controllers\Auth;

use App\Core\Auth\Dto\LoginRequestDto;
use App\Core\Auth\UseCase\LoginUser;
use App\External\Api\Request\Auth\LoginRequest;
use App\Http\Controllers\Controller;
use App\Shared\Exceptions\Interfaces\DomainException;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function __construct(
        private LoginUser $loginUser,
    ) {
    }

    public function __invoke(LoginRequest $request)
    {
        try {
            $municipality = app('current_municipality');

            $loginDto = new LoginRequestDto(
                $request->input('user_identifier'),
                $request->input('password'),
                $request->boolean('remember_me'),
            );

            $result = $this->loginUser->execute($loginDto, $municipality->slug);

            return redirect()->to($result->redirect);

        } catch (DomainException $e) {
            throw ValidationException::withMessages([
                'user_identifier' => [$e->getMessage()],
            ]);
        }
    }
}
