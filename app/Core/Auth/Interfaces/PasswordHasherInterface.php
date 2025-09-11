<?php

namespace App\Core\Auth\Interfaces;

interface PasswordHasherInterface
{
    public function verify(string $password, string $hashedPassword): bool;
}
