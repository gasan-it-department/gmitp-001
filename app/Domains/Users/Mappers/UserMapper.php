<?php

namespace App\Domains\Users\Mappers;

use App\Domains\Models\User;
use App\Domains\Users\Dtos\UserDto;

use App\Models\User as EloquentUser;

class UserMapper
{
    public static function toDto(User $user): UserDto
    {
        return new UserDto(

            id: $user->id,
            first_name: $user->first_name,
            last_name: $user->last_name,
            middle_name: $user->middle_name,
            email: $user->email,
            age: $user->age,
            address: $user->address,
            gender: $user->gender,
            phone: $user->phone,
            password: $user->password,
            role: $user->role,

        );

    }
}
