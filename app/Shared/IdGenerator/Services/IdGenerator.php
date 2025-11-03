<?php

namespace App\Shared\IdGenerator\Services;

use Illuminate\Support\Str;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
class IdGenerator implements IdGeneratorInterface
{
    public function generate(): string
    {
        return (string) Str::ulid();
    }
}