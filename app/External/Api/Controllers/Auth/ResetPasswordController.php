<?php

namespace App\External\Api\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use App\Http\Controllers\Controller;
use App\Core\Users\UseCases\GetUserByPhoneUseCase;
use App\Core\Users\UseCases\UpdatePasswordUseCase;
use App\Core\Auth\Interfaces\CookieSessionInterface;

class ResetPasswordController extends Controller
{

    public function __construct(
        private GetUserByPhoneUseCase $getUserByPhoneUseCase,
        private UpdatePasswordUseCase $updatePasswordUseCase,
        private CookieSessionInterface $cookieSessionInterface,
    ) {
    }

    public function store(Request $request, string $phone)
    {

        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $this->updatePasswordUseCase->execute($phone, $request->password);

        $this->cookieSessionInterface->createAuthenticatedSession($user->id);

        return redirect()->route('landing')
            ->with('success', 'Password reset successfully.');

    }

}