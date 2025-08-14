<?php

namespace App\Core\Users\Domains\Interfaces;

use App\Core\Users\Domains\Aggregates\UserAggregate;
interface UserRepositoryInterface
{
    public function save(UserAggregate $user): UserAggregate;
    public function findById(string $id): ?UserAggregate;
    public function findByUuid(string $uuid): ?UserAggregate;
    public function findByPhone(string $phone): ?UserAggregate;
    public function findByUserName(string $userName): ?UserAggregate;

}