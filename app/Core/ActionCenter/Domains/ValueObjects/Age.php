<?php

namespace App\Core\ActionCenter\Domains\ValueObjects;

final readonly class Age
{
    public function __construct(private int $value)
    {
        if ($value < 0 || $value > 120) {
            throw new \InvalidArgumentException('Age must be between 0 and 120.');
        }

    }

    public function getValue(): int
    {
        return $this->value;
    }
}

