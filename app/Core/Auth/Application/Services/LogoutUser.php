<?php

namespace App\Core\Auth\Application\Services;

use App\Core\Auth\Domain\Contracts\AuthSessionRepositoryInterface;
class LogoutUser
{
    public function __construct(
        private AuthSessionRepositoryInterface $sesionRepository
    ) {
    }

    public function execute(string $token): bool
    {
        try {
            $this->sesionRepository->invalidate($token);
            return true;

        } catch (\Exception $e) {
            return false;
        }
    }

    public function logoutAllDevices(int $userId): bool
    {
        try {
            $this->sesionRepository->invalidateAllForUser($userId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}