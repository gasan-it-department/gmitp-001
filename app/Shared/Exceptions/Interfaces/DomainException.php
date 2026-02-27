<?php

namespace App\Shared\Exceptions\Interfaces;

use RuntimeException;

abstract class DomainException extends RuntimeException
{

    public function report(): bool
    {
        return false;
    }
    abstract public function status(): int;
    abstract public function errorCode(): string;

}