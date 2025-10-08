<?php

namespace App\Shared\Services;

use Illuminate\Support\Str;
use App\Shared\Contracts\IdGeneratorInterface;
class IdGenerator implements IdGeneratorInterface
{
    public function generate(): string
    {
        return (string) Str::ulid();
    }
}