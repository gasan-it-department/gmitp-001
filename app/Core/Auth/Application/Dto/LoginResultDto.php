<?php

namespace App\Core\Auth\Application\Dto;

use App\Core\Auth\Application\Dto\AuthResponseDto;
class LoginResultDto
{
    public function __construct(
        public readonly bool $success,
        public readonly ?AuthResponseDto $auth_data = null,
        public readonly ?string $error_message = null,
        public readonly bool $account_locked = false,
        public readonly ?int $lockoutDurationMinutes = null,
        public readonly ?int $remainingAttempts = null
    ) {
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'auth_data' => $this->auth_data?->toArray(),
            'error_message' => $this->error_message,
            'account_locked' => $this->account_locked,
            'lockout_duration_minutes' => $this->lockoutDurationMinutes,
            'remaining_attempts' => $this->remainingAttempts,
        ];
    }
}