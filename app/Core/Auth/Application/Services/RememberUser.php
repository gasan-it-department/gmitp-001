<?php

namespace App\Core\Auth\Application\Services;

use App\Core\Auth\Application\Dto\AuthResponseDto;
use App\Core\Auth\Domain\Contracts\AuthSessionRepositoryInterface;
use App\Core\Auth\Domain\Policies\RememberMePolicy;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Auth\Application\Mapper\UserMapper;
use App\Core\Auth\Application\Dto\RememberUserDto;
class RememberUser
{
    public function __construct(
        private AuthSessionRepositoryInterface $sessionRepository,
        private UserRepositoryInterface $userRepository
    ) {
    }

    public function execute(RememberUserDto $dto): ?AuthResponseDto
    {
        $session = $this->sessionRepository->findByToken($dto->token);

        if (!$session || $session->isExpired() || !$session->isRememberToken()) {
            return null;
        }

        $user = $this->userRepository->findById($session->getUserId());

        if (!$user) {
            $this->sessionRepository->invalidate($dto->token);
            return null;
        }
        $userMapper = new UserMapper();
        $user_data = $userMapper->toArray($user);
        return new AuthResponseDto(
            token: $session->getToken(),
            expires_at: $session->getExpiresAt(),
            user_data: $user_data,
            isRemembered: true
        );
    }
}