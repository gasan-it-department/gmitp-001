<?php

namespace App\Domains\Users\Mappers;

use App\Domains\Users\Models\User;
use App\Domains\Users\Dtos\UserDto;

use App\Models\User as EloquentUser;

class UserMapper
{
    public static function toDto(User $user): UserDto
    {
        return new UserDto(

            id: $user->id,
            phone: $user->phone,
            user_name: $user->user_name,
            password: $user->password,
            role: $user->role,

        );

    }
}
