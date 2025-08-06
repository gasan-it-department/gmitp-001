<?php

namespace App\Core\Users\Domains\Entities;

use App\Core\Users\Domains\ValueObjects\{Phone, Password, UserId, UserName, Role};
;
final class User
{
    public function __construct(
        public readonly UserName $user_name,
        public readonly Phone $phone,
        public readonly Password $password,
        public readonly Role $role
    ) {
    }

}