<?php

namespace App\Core\Auth\Application\Services;

use App\Core\Auth\Domain\Contracts\AuthSessionRepositoryInterface;
use App\Core\Auth\Application\Dto\{AuthResponseDto, LoginResultDto, LoginRequestDto};
use App\Core\Auth\Domain\Contracts\LoginAttemptRepositoryInterface;
use App\Core\Auth\Domain\Entities\{LoginUserRequest, AuthSession, LoginAttempt};
use App\Core\Auth\Domain\Policies\{AccountLockoutPolicy, RememberMePolicy};
use App\Core\Auth\Application\Exceptions\InvalidCredentialsException;
use App\Core\Auth\Application\Mapper\UserMapper;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
//Calling the FindByuserName() of user from the Users domain
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;

class LoginUser
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private AuthSessionRepositoryInterface $sesionRepository,
        private AccountLockoutPolicy $lockoutPolicy,
        private RememberMePolicy $rememberPolicy,
        private LoginAttemptRepositoryInterface $attemptRepository,
        private TrackingLoginAttempt $trackingLoginAttempt,
        private UserMapper $userMapper
    ) {
    }
    public function execute(LoginRequestDto $dto): LoginResultDto
    {
        $request = new LoginUserRequest(
            $dto->user_name,
            $dto->password,
            $dto->remember_me,
            $dto->ip_address,
            $dto->user_agent,

        );

        //check if account is lock due to multiple attempts
        if ($this->attemptRepository->isLocked($request->getUsername())) {
            return new LoginResultDto(
                success: false,
                error_message: 'Account is temporarily locked due to too many failed attempts',
                account_locked: true,
                lockoutDurationMinutes: $this->lockoutPolicy->getLockDurationMinutes()
            );
        }

        //find the user
        $user = $this->userRepository->findByUserName($request->getUsername())
            ?? $this->userRepository->findByPhone($request->getUsername());

        if (!$user) {
            $this->trackingLoginAttempt->execute($request, false, 'User not found');
            return $this->handleFailedLogin($request);
        }

        if (!$user->verifyPassword($request->getPassword())) {
            $this->trackingLoginAttempt->execute($request, false, 'Invalid Password');
            return $this->handleFailedLogin($request);
        }
        //successful login = clear failed attempts
        $this->attemptRepository->clearAttempts($request->getUsername());
        $this->trackingLoginAttempt->execute($request, true);

        $token = Str::random(60);
        dd($token);
        $expiration = $request->shouldRememberUser()
            ? $this->rememberPolicy->getTokenExpiration()
            : $this->rememberPolicy->getSessionExpiration();

        $session = new AuthSession(
            token: $token,
            user_id: $user->getId(),
            expires_at: $expiration,
            remember_token: $request->shouldRememberUser(),
            ip_address: $request->getIpAddress(),
            user_agent: $request->getUserAgent(),
        );
        $this->sesionRepository->create($session);

        $userMapper = new UserMapper();
        $user_data = $userMapper->toArray($user);
        $auth_data = new AuthResponseDto(
            token: $token,
            expires_at: $expiration,
            user_data: $user_data,
            isRemembered: $request->shouldRememberUser()
        );
        return new LoginResultDto(true, $auth_data);
    }

    public function handleFailedLogin(LoginUserRequest $request): LoginResultDto
    {
        // Logic for handling failed login attempts
        $failedAttempts = $this->attemptRepository->getFailedAttemptCount(
            user_name: $request->getUsername(),
            within_minutes: $this->lockoutPolicy->getAttemptWindowMinutes(),
        );

        if ($this->lockoutPolicy->shouldLockAccount($failedAttempts)) {
            $this->attemptRepository->lockAccount(
                $request->getUsername(),
                $this->lockoutPolicy->getLockDurationMinutes()
            );
            return new LoginResultDto(
                success: false,
                error_message: 'Account locked due to too many failed attempts',
                account_locked: true,
                lockoutDurationMinutes: $this->lockoutPolicy->getLockDurationMinutes(),
            );
        }
        $remainingAttempts = $this->lockoutPolicy->getMaxAttempts() - $failedAttempts;

        return new LoginResultDto(
            success: false,
            error_message: 'Invalid Credentials',
            remainingAttempts: $remainingAttempts,
        );
    }

    // public function createAuthSession(int $userId, bool $remember_me): AuthSession
    // {
    //     // Logic for creating an authentication session
    //     $token = bin2hex(random_bytes(32));
    //     $expiresAt = $remember_me
    //         ? $this->rememberPolicy->getTokenExpiry()
    //         : $this->rememberPolicy->getSessionExpiry();

    //     return new AuthSession(
    //         $token,
    //         $userId,
    //         $expiresAt,
    //         $remember_me,
    //     );
    // }

    // private function recordLoginAttempt(string $identifier, string $ipAddress, bool $successful, ?string $userAgent): void
    // {
    //     $attempt = new LoginAttempt(
    //         identifier: $identifier,
    //         ipAddress: $ipAddress,
    //         successful: $successful,
    //         userAgent: $userAgent
    //     );
    //     $this->attemptRepository->record($attempt);
    // }
}