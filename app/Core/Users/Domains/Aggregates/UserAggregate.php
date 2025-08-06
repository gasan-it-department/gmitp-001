<?php

namespace App\Core\Users\Domains\Aggregates;

use App\Core\Users\Domains\ValueObjects\{Phone, Password, UserName, Role};


class UserAggregate
{
    public function __construct(
        public readonly UserName $user_name,
        public readonly Phone $phone,
        public readonly Password $password,
        public readonly Role $role,
    ) {
    }

    public static function register(
        UserName $user_name,
        Phone $phone,
        Password $password,
        Role $role
    ): self {
        return new self(
            $user_name,
            $phone,
            $password,
            $role
        );
    }


}