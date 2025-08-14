<?php

namespace App\Core\ActionCenter\Domains\ValueObjects;

final readonly class ContactNumber
{
    public function __construct(private string $value)
    {
        if (empty($value)) {
            throw new \InvalidArgumentException('Contact number cannot be empty.');
        }
    }

    public function getValue(): string
    {
        return $this->value;
    }
}