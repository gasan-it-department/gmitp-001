<?php

namespace App\Core\Users\Infrastructure\Services;

use App\Core\Users\Application\Interfaces\UuidServiceInterface;
use Ramsey\Uuid\Uuid;

final readonly class UuidGeneratorService implements UuidServiceInterface
{
    public function generate(): string
    {
        return Uuid::uuid4()->toString();
    }
}