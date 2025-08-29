<?php

namespace App\Core\Auth\Application\Services;

use App\Core\Auth\Domain\Contracts\LoginAttemptRepositoryInterface;
use App\Core\Auth\Domain\Entities\LoginAttempt;
use App\Core\Auth\Domain\Entities\LoginUserRequest;
class TrackingLoginAttempt
{
    private LoginAttemptRepositoryInterface $attemptRepository;

    public function __construct(
        LoginAttemptRepositoryInterface $attemptRepository,
    ) {
        $this->attemptRepository = $attemptRepository;
    }

    public function execute(LoginUserRequest $request, bool $successful, ?string $failure_reason = null): void
    {
        $attempt = new LoginAttempt(
            $request->getUsername(),
            $request->getIpAddress(),
            $successful,
            $failure_reason,
        );

        $this->attemptRepository->store($attempt);
    }
}