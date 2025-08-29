<?php

namespace App\Core\Auth\Domain\Entities;

class AuthSession
{
    private string $token;
    private string $user_id;
    private \DateTime $expires_at;
    private bool $remember_token;
    private \DateTime $created_at;
    private ?string $ip_address;
    private ?string $user_agent;
    public function __construct(
        string $token,
        string $user_id,
        \DateTime $expires_at,
        bool $remember_token = false,
        ?string $ip_address = null,
        ?string $user_agent = null,
    ) {
        $this->token = $token;
        $this->user_id = $user_id;
        $this->expires_at = $expires_at;
        $this->remember_token = $remember_token;
        $this->created_at = new \DateTime();
        $this->ip_address = $ip_address;
        $this->user_agent = $user_agent;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getUserId(): string
    {
        return $this->user_id;
    }
    public function isExpired(): bool
    {
        return new \DateTime() > $this->expires_at;
    }
    public function getCreatedAt(): ?\DateTime
    {
        return $this->created_at;
    }

    public function getExpiresAt(): \DateTime
    {
        return $this->expires_at;
    }

    public function isRememberToken(): bool
    {
        return $this->remember_token;
    }

    public function extend(\DateTime $newExpiration): void
    {
        $this->expires_at = $newExpiration;
    }
    public function getIpAdress(): ?string
    {
        return $this->ip_address;
    }
    public function getUserAgent(): ?string
    {
        return $this->user_agent;
    }
}