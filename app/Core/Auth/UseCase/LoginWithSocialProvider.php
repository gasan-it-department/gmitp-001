<?php

namespace App\Core\Auth\UseCase;

use App\Core\Auth\Actions\AuthenticateSocialUserAction;
use App\Core\Auth\Dto\LoginResponseDto;
use App\Core\Auth\Dto\SocialUserDto;
use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\Core\Auth\Services\LoginRedirectionService;

class LoginWithSocialProvider
{
    public function __construct(
        private AuthenticateSocialUserAction $authenticateSocialUser,
        private CookieSessionInterface $cookieSessionService,
        private LoginRedirectionService $loginRedirectionService,
    ) {
    }

    /**
     * Coordinate social authentication with session creation.
     */
    public function execute(SocialUserDto $dto, string $municipalitySlug): LoginResponseDto
    {
        // Step 1: Resolve or create the user (Existing Action)
        $user = $this->authenticateSocialUser->execute($dto);

        // Step 2: Create the session — identical to what LoginUser does
        $sessionData = $this->cookieSessionService->createAuthenticatedSession($user->id, false);

        // Step 3: Redirect using the same logic as phone/password login
        $redirect = $this->loginRedirectionService->redirectUser($user, $municipalitySlug);

        // Step 4: Return the same DTO the phone/password path already returns
        return new LoginResponseDto(
            message: 'Social login successful',
            accessToken: null,          // Always null for web — tokens are for API clients
            tokenType: 'Session',
            expiresIn: $sessionData['expires_in'],
            user: $user,
            redirect: $redirect,
        );
    }
}
