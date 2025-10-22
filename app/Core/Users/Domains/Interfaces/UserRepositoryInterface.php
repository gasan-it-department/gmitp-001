<?php

namespace App\Core\Users\Domains\Interfaces;

use App\Core\Users\Domains\Aggregates\UserAggregate;
use App\Core\Users\Domains\ValueObjects\{Phone, Password, UserName, Role};

interface UserRepositoryInterface
{
    public function save(UserAggregate $user): UserAggregate;
    public function findById(string $id): ?UserAggregate;
    public function findByPhone(string $phone): ?UserAggregate;
    public function findByUserName(string $userName): ?UserAggregate;
}