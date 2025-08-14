<?php

namespace App\Core\Users\Infrastructure\Services;

use App\Core\Users\Application\Interfaces\PasswordHasherInterface;
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