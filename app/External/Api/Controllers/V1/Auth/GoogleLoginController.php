<?php

namespace App\External\Api\Controllers\V1\Auth;

use App\Core\Auth\Actions\AuthenticateSocialUserAction;
use App\Core\Auth\Dto\SocialUserDto;
use App\Core\Auth\Exceptions\AccountDeactivatedException;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleLoginController extends Controller
{
    public function __construct(
        private AuthenticateSocialUserAction $authenticateSocialUser,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'access_token' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $socialiteUser = Socialite::driver('google')
            ->stateless()
            ->userFromToken($validated['access_token']);

        $user = $this->authenticateSocialUser->execute(
            SocialUserDto::fromSocialite('google', $socialiteUser)
        );

        if ($user->isDeactivated()) {
            throw new AccountDeactivatedException();
        }

        $token = $user->createToken(
            $validated['device_name'] ?? 'mobile-app'
        )->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                ],
            ],
        ]);
    }
}