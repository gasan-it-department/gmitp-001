<?php

namespace App\Core\Auth\Domain\Entities;

class AuthResults
{
    public function __construct(
        private bool $success,
        private ?array $userData = null,
        private ?string $token = null,
        private ?string $failureReason = null,
    ) {
    }

    public function isSuccessful(): bool
    {
        return $this->success;
    }

    public function getUserData(): ?array
    {
        return $this->userData;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function getFailureReason(): ?string
    {
        return $this->failureReason;
    }

    public static function success(array $userData, string $token): self
    {
        return new self(true, $userData, $token);
    }

    public static function failure(string $reason): self
    {
        return new self(false, null, null, $reason);
    }
}
