<?php

namespace App\Core\Users\Services;

use App\Core\Users\Interfaces\PasswordHasherInterface;
use Illuminate\Support\Facades\Hash;

final readonly class PasswordHasherService implements PasswordHasherInterface
{
    public function hash(string $password): string
    {
        return Hash::make($password);
    }

    public function verify(string $password, string $hash): bool
    {
        return Hash::check($password, $hash);
    }

}