<?php

namespace App\Core\ActionCenter\Domains\ValueObjects;

final readonly class Address
{
    public function __construct(private string $value)
    {
        if (empty($value)) {
            throw new \InvalidArgumentException('Address cannot be empty.');
        }
    }

    public function getValue(): string
    {
        return $this->value;
    }
}