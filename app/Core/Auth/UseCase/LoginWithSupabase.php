<?php

namespace App\Core\Auth\UseCase;

use App\Core\Auth\Actions\AuthenticateSupabaseUserAction;
use App\Core\Auth\Dto\LoginResponseDto;
use App\Core\Auth\Dto\SupabaseUserDto;
use App\Core\Auth\Exceptions\AccountDeactivatedException;
use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\Core\Auth\Services\LoginRedirectionService;

class LoginWithSupabase
{
    public function __construct(
        private AuthenticateSupabaseUserAction $authenticateSupabaseUser,
        private CookieSessionInterface $cookieSessionService,
        private LoginRedirectionService $loginRedirectionService,
    ) {}

    public function execute(
        SupabaseUserDto $dto,
        string $municipalitySlug,
        bool $rememberMe = false,
    ): LoginResponseDto {
        $user = $this->authenticateSupabaseUser->execute($dto);

        if ($user->isDeactivated()) {
            throw new AccountDeactivatedException;
        }

        $sessionData = $this->cookieSessionService->createAuthenticatedSession($user->id, $rememberMe);
        $redirect = $this->loginRedirectionService->redirectUser($user, $municipalitySlug);

        return new LoginResponseDto(
            message: 'Supabase login successful',
            accessToken: null,
            tokenType: 'Session',
            expiresIn: $sessionData['expires_in'],
            user: $user,
            redirect: $redirect,
        );
    }
}
