<?php

namespace App\External\Api\Controllers\Profile;

use App\Core\Auth\Actions\AuthenticateSocialUserAction;
use App\Core\Auth\Dto\SocialUserDto;
use App\External\Api\Resources\User\UserSocialAccountResource;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class LinkSocialAccountController extends Controller
{
    public function __construct(
        private AuthenticateSocialUserAction $authenticateSocialUserAction,
    ) {
    }

    /**
     * Links a social provider account to the currently authenticated user.
     * Used by phone-only registrants who want to attach a Google account
     * from their profile page. Writes Google's pre-verified email back onto
     * the users table so no separate email verification step is needed.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => ['required', 'string'],
            'access_token' => ['required', 'string'],
        ]);

        try {
            $provider = $request->input('provider');
            $token = $request->input('access_token');

            $socialiteUser = Socialite::driver($provider)
                ->stateless()
                ->userFromToken($token);

            // Pass auth()->id() so the action attaches to the existing user
            // instead of creating a new one
            $this->authenticateSocialUserAction->execute(
                SocialUserDto::fromSocialite($provider, $socialiteUser),
                auth()->id(),
            );

            // Reload social accounts so the frontend can update
            // its UI immediately without a full page refresh
            $user = auth()->user()->load('socialAccounts');

            return response()->json([
                'success'         => true,
                'message'         => 'Google account linked successfully.',
                'social_accounts' => UserSocialAccountResource::collection($user->socialAccounts),
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
