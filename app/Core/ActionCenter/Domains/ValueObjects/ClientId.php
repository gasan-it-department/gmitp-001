<?php

namespace App\Core\ActionCenter\Domains\ValueObjects;

final readonly class ClientId
{

    public function __construct(public string $value)
    {
        if (empty($value)) {
            throw new \InvalidArgumentException('Client ID cannot be empty.');
        }
    }

    public function getValue(): string
    {
        return $this->value;
    }
}