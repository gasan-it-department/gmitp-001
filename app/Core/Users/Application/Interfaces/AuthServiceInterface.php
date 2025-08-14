<?php

namespace App\Core\Users\Application\Interfaces;

use App\Core\Users\Domains\Aggregates\UserAggregate;
use App\Core\Users\Infrastructure\Models\User as EloquentUser;
interface AuthServiceInterface
{
    public function login(UserAggregate $user): void;

    public function logout(): void;
}