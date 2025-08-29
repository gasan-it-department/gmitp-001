<?php

namespace App\Core\Auth\Application\Mapper;

use App\Core\Users\Domains\Aggregates\UserAggregate as User;
class UserMapper
{
    public function toArray(User $user): array
    {
        return [
            'id' => $user->getId(),
            'uuid' => $user->getUuid(),
            'username' => $user->getUserName(),
            'phone' => $user->getPhone(),
        ];
    }
}