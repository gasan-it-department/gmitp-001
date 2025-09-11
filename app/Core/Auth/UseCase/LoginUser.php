<?php

namespace App\Core\Auth\UseCase;

use App\Core\Auth\Dto\LoginRequestDto;
use App\Core\Auth\Dto\LoginResponseDto;
use App\Core\Auth\Exceptions\AccountLockedExceptions;
use App\Core\Auth\Exceptions\InvalidCredentialsExceptions;
use App\Core\Auth\Exceptions\InvalidPasswordException;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Auth\Interfaces\PasswordHasherInterface;
use App\Core\Auth\Interfaces\TokenServiceInterface;
use App\Core\Auth\Interfaces\RateLimiterInterface;
use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\Core\Auth\Services\LaravelSessionService;
class LoginUser
{

    private const LOCKOUT_MINUTES = 5;
    private const RATE_LIMIT_ATTEMPTS = 20;
    private const RATE_LIMIT_MINUTES = 5;

    public function __construct(
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
        private TokenServiceInterface $tokenService,
        private RateLimiterInterface $rateLimiter,
        private CookieSessionInterface $cookieSessionService
    ) {
    }
    public function execute(LoginRequestDto $dto): LoginResponseDto
    {
        // Create a unique key for the rate limiter based on IP and identifier
        $identifierKey = hash('sha256', $dto->identifier);
        $rateLimitKey = "login:ip:" . request()->ip() . "|identifier:{$identifierKey}";

        if ($this->rateLimiter->tooManyAttempts($rateLimitKey, self::RATE_LIMIT_ATTEMPTS)) {
            $remainingSeconds = $this->rateLimiter->availableIn($rateLimitKey);
            throw new AccountLockedExceptions(ceil($remainingSeconds / 60));
        }

        //find the user identifier and add rate limiter hit if not found
        $users = $this->userRepository->findByUserName($dto->identifier)
            ?? $this->userRepository->findByPhone($dto->identifier);

        if (!$users) {
            $this->rateLimiter->hit($rateLimitKey, self::RATE_LIMIT_MINUTES);
            throw new InvalidCredentialsExceptions();
        }

        //check the password
        if (!$this->passwordHasher->verify($dto->password, $users->password->getValue())) {
            $this->rateLimiter->hit($rateLimitKey, self::RATE_LIMIT_MINUTES);
            throw new InvalidPasswordException();
        }

        //clear the ratelimiter after success
        $this->rateLimiter->clear($rateLimitKey);

        //give token to logged the user
        $sessionData = $this->cookieSessionService->createAuthenticatedSession($users->getId(), $dto->rememberMe);

        return new LoginResponseDto(
            'login successful',
            null,
            'Session',
            $sessionData['expires_in'],
            $users->toArray()
        );
    }
}