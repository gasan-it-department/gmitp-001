<?php

namespace App\Core\Auth\Domain\Entities;

class LoginAttempt
{
    private string $user_name;
    private string $ip_address;
    private \DateTime $attempted_at;
    private bool $successful;
    private ?string $failure_reason;

    public function __construct(
        string $user_name,
        string $ip_address,
        bool $successful = false,
        ?string $failure_reason = null
    ) {
        $this->user_name = $user_name;
        $this->ip_address = $ip_address;
        $this->attempted_at = new \DateTime();
        $this->successful = $successful;
        $this->failure_reason = $failure_reason;
    }

    public function getUsername(): string
    {
        return $this->user_name;
    }

    public function getIpAddress(): string
    {
        return $this->ip_address;
    }

    public function getAttemptedAt(): \DateTime
    {
        return $this->attempted_at;
    }

    public function wasSuccessful(): bool
    {
        return $this->successful;
    }

    public function getFailureReason(): ?string
    {
        return $this->failure_reason;
    }

    public function getIdentifier(): string
    {
        return $this->user_name . '_' . $this->ip_address;
    }

}