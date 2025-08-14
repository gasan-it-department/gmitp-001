<?php

namespace App\Core\Users\Infrastructure\Services;

use App\Core\Users\Application\Interfaces\AuthServiceInterface;
use App\Core\Users\Domains\Aggregates\UserAggregate;
use App\Core\Users\Infrastructure\Models\User as EloquentUser;
use Illuminate\Support\Facades\Auth;

final readonly class AuthService implements AuthServiceInterface
{

    public function login(UserAggregate $userAggregate): void
    {
        $eloquentUser = EloquentUser::where('uuid', $userAggregate->getUuid())->first();

        if (!$eloquentUser) {
            throw new RuntimeException('User not found for authentication');
        }
        Auth::login($eloquentUser);

    }

    public function logout(): void
    {

    }
}