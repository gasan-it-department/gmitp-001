<?php

namespace App\Core\Auth\Services;

use Illuminate\Support\Facades\Hash;
use App\Core\Auth\Interfaces\PasswordHasherInterface;
class LaravelPasswordHasher implements PasswordHasherInterface
{
    public function verify(string $password, string $hashedPassword): bool
    {
        return Hash::check($password, $hashedPassword);
    }
}
