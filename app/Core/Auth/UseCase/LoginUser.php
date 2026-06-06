<?php

namespace App\Core\Auth\UseCase;

use App\Core\Auth\Dto\LoginRequestDto;
use App\Core\Auth\Dto\LoginResponseDto;
use App\Core\Auth\Exceptions\AccountLockedExceptions;
use App\Core\Auth\Exceptions\InvalidCredentialsExceptions;
use App\Core\Auth\Exceptions\InvalidPasswordException;
use App\Core\Auth\Services\LoginRedirectionService;
use App\Core\Auth\Services\VerificationSenderService;
use App\Core\Users\Repository\UserRepository;
use App\Core\Auth\Interfaces\PasswordHasherInterface;
use App\Core\Auth\Interfaces\TokenServiceInterface;
use App\Core\Auth\Interfaces\RateLimiterInterface;
use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\Core\Users\ValueObjects\Phone;

class LoginUser
{

    private const LOCKOUT_MINUTES = 5;
    private const RATE_LIMIT_ATTEMPTS = 20;
    private const RATE_LIMIT_MINUTES = 5;

    public function __construct(
        private UserRepository $userRepository,
        private PasswordHasherInterface $passwordHasher,
        private TokenServiceInterface $tokenService,
        private RateLimiterInterface $rateLimiter,
        private CookieSessionInterface $cookieSessionService,
        private LoginRedirectionService $loginRedirectionService,
        private VerificationSenderService $verificationSenderService
    ) {
    }
    public function execute(LoginRequestDto $dto, $slug): LoginResponseDto
    {
        // Create a unique key for the rate limiter based on IP and identifier
        $identifierKey = hash('sha256', $dto->identifier);

        $rateLimitKey = "login:ip:" . request()->ip() . ':' . $identifierKey;

        if ($this->rateLimiter->tooManyAttempts($rateLimitKey, self::RATE_LIMIT_ATTEMPTS)) {
            $remainingSeconds = $this->rateLimiter->availableIn($rateLimitKey);
            throw new AccountLockedExceptions(ceil($remainingSeconds / 60));
        }

        // Resolve the user by phone or email — whichever the identifier looks like
        $isEmail = filter_var($dto->identifier, FILTER_VALIDATE_EMAIL);
        $identifier = $dto->identifier;

        if (!$isEmail) {
            try {
                $identifier = (new Phone($dto->identifier))->toString();
            } catch (\InvalidArgumentException $e) {
                // Not a valid phone format, search using raw string
            }
        }

        $users = $isEmail
            ? $this->userRepository->findByEmail($identifier)
            : $this->userRepository->findByPhone($identifier);

        if (!$users) {
            $this->rateLimiter->hit($rateLimitKey, self::RATE_LIMIT_MINUTES);
            throw new InvalidCredentialsExceptions();
        }

        //check the password
        if (!$this->passwordHasher->verify($dto->password, $users->password)) {
            $this->rateLimiter->hit($rateLimitKey, self::RATE_LIMIT_MINUTES);
            throw new InvalidPasswordException();
        }

        //clear the ratelimiter after success
        $this->rateLimiter->clear($rateLimitKey);

        //give token to logged the user
        $sessionData = $this->cookieSessionService->createAuthenticatedSession($users->id, $dto->rememberMe);

        $redirectUrl = $this->loginRedirectionService->redirectUser($users, $slug);

        if (!is_null($users->phone) && is_null($users->phone_verified_at)) {

            $this->verificationSenderService->send($users->phone);

        }


        return new LoginResponseDto(
            'login successful',
            null,
            'Session',
            $sessionData['expires_in'],
            $users,
            $redirectUrl,
        );

    }
}