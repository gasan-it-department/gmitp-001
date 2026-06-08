<?php

namespace App\External\Api\Controllers\Auth\Login;

use App\Core\Auth\Dto\SocialUserDto;
use App\Core\Auth\UseCase\LoginWithSocialProvider;
use App\Http\Controllers\Controller;
use App\Shared\Exceptions\Interfaces\DomainException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Nette\Schema\ValidationException;

class AuthenticateSocialUserController extends Controller
{
    public function __construct(
        private LoginWithSocialProvider $loginWithSocialProvider,
    ) {
    }

    /**
     * Handles social (e.g. Google) authentication.
     * Expects a 'provider' and an 'access_token' from the client-side OAuth flow.
     * Creates a cookie session — identical to the phone/password login path.
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'provider' => ['required', 'string'],
            'access_token' => ['required', 'string'],
        ]);


        $provider = $request->input('provider');
        $token = $request->input('access_token');

        // Verify the access token directly with the provider (no redirect/callback needed)
        $socialiteUser = Socialite::driver($provider)
            ->stateless()
            ->userFromToken($token);

        $municipality = app('current_municipality');

        $result = $this->loginWithSocialProvider->execute(
            SocialUserDto::fromSocialite($provider, $socialiteUser),
            $municipality->slug,
        );

        return response()->json([
            'success' => true,
            'redirect' => $result->redirect,
        ]);

    }
}
