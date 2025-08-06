<?php

namespace App\Core\Users\Domains\Interfaces;

use App\Core\Users\Domains\Aggregates\UserAggregate;
interface UserRepositoryInterface
{
    public function save(UserAggregate $user): void;

}