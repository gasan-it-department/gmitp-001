<?php

namespace App\Core\Users\Interfaces;

interface PasswordHasherInterface
{
    public function hash(string $password): string;

    public function verify(string $password, string $hash): bool;
}
