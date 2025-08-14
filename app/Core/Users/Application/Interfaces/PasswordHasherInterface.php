<?php

namespace App\Core\Users\Application\Interfaces;

interface PasswordHasherInterface
{
    public function hash(string $password): string;

    public function verify(string $password, string $hash): bool;
}
