<?php

namespace App\External\Api\Controllers\Auth\Login;

use App\Core\Auth\Actions\AuthenticateSocialUserAction;
use App\Core\Auth\Dto\SocialUserDto;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthenticateSocialUserController extends Controller
{
    public function __construct(
        private AuthenticateSocialUserAction $authenticateSocialUserAction
    ) {
    }

    /**
     * Stateless API endpoint for social authentication.
     * Expects a 'provider' (google, etc) and an 'access_token' from the client.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => ['required', 'string'],
            'access_token' => ['required', 'string'],
        ]);

        try {
            // Verify the token with the provider
            $socialiteUser = Socialite::driver($request->string('provider'))
                ->userFromToken($request->string('access_token'));

            // Hand off to the core logic layer
            $user = $this->authenticateSocialUserAction->execute(
                SocialUserDto::fromSocialite($request->string('provider'), $socialiteUser)
            );

            // Log in for web sessions (if applicable)
            Auth::login($user);

            return response()->json([
                'user' => $user,
                'token' => $user->createToken('social_login')->plainTextToken,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Social authentication failed.',
                'message' => $e->getMessage(),
            ], 401);
        }
    }
}