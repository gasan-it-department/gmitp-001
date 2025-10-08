<?php

namespace App\Core\Users\Infrastructure\Mapper;

use App\Core\Users\Domains\Aggregates\UserAggregate;
use App\Core\Users\Infrastructure\Models\User as EloquentUser;
class ToEloquentUserMapper
{
    public static function toEloquent(UserAggregate $user): EloquentUser
    {
        $eloquentUser = new EloquentUser();

        $eloquentUser->id = $user->id;
        $eloquentUser->user_name = $user->user_name;
        $eloquentUser->phone = $user->phone;

        return $eloquentUser;
    }
}