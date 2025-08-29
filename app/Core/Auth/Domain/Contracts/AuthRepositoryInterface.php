<?php

namespace App\Core\Auth\Domain\Contracts;

interface AuthRepositoryInterface
{
    public function findUserName(): array;
}