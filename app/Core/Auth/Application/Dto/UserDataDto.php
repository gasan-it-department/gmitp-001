<?php

namespace App\Core\Auth\Application\Dto;

use App\Core\Users\Domains\Aggregates\UserAggregate;

class UserDataDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $uuid,
        public readonly string $user_name,
        public readonly string $phone,
    ) {
    }

    public static function fromUser(UserAggregate $user): self
    {
        return new self(
            id: $user->getId(),
            uuid: $user->getUuid(),
            user_name: $user->getUserName(),
            phone: $user->getPhone(),
        );
    }
}