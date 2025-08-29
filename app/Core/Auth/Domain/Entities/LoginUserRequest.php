<?php

namespace App\Core\Auth\Domain\Entities;

use App\Core\Auth\Application\Exceptions\InvalidCredentialsException;

class LoginUserRequest
{
    private string $user_name;
    private string $password;
    private bool $remember_me;
    private \DateTime $attempted_at;
    private ?string $ip_address;
    private ?string $user_agent;

    public function __construct(
        string $user_name,
        string $password,
        bool $remember_me = false,
        ?string $ip_address = null,
        ?string $user_agent = null,
    ) {
        $this->user_name = $user_name;
        $this->password = $password;
        $this->remember_me = $remember_me;
        $this->attempted_at = new \DateTime();
        $this->ip_address = $ip_address;
        $this->user_agent = $user_agent;
    }

    public function getUsername(): string
    {
        return $this->user_name;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function shouldRememberUser(): bool
    {
        return $this->remember_me;
    }

    public function getAttemptedAt(): \DateTime
    {
        return $this->attempted_at;
    }

    public function getIpAddress(): ?string
    {
        return $this->ip_address;
    }

    public function getUserAgent(): ?string
    {
        return $this->user_agent;
    }

    public function isValid(): bool
    {

        return !empty($this->user_name) &&
            !empty($this->password) &&
            strlen($this->password) >= 6;
    }

    public function getIdentifier(): string
    {
        return $this->user_name . '_' . $this->attempted_at->format('Y-m-d H:i:s');
    }
    // public function incrementLastattempt(): self
    // {
    //     return new self(
    //         $this->user_name,
    //         $this->password,
    //         $this->remember_me,
    //         $this->attemptCount + 1,
    //         new \DateTimeImmutable(),
    //     );
    // }

    // public function validateCredentials(): void
    // {
    //     if (empty($this->user_name) || empty($this->password)) {
    //         throw new InvalidCredentialsException('Username and Password are required');
    //     }

    //     if (strlen($this->password) < 8) {
    //         throw new InvalidCredentialsException('Password must be at least 8 characters long');
    //     }
    // }

}
