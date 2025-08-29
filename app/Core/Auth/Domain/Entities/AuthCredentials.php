<?php

namespace App\Core\Auth\Domain\Entities;

class AuthCredentials
{
    public function __construct(
        private string $user_name,
        private string $plainPassword,
        private bool $remeber_me = false,
    ) {
    }

    public function getUsername(): string
    {
        return $this->user_name;
    }


    public function getPlainPassword(): string
    {
        return $this->plainPassword;
    }

    public function shouldRemember(): bool
    {
        return $this->remeber_me;
    }

}
