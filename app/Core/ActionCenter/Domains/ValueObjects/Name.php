<?php

namespace App\Core\ActionCenter\Domains\ValueObjects;

final readonly class Name
{
    public function __construct(private string $value)
    {

        if (empty($value)) {
            throw new \InvalidArgumentException('Name cannot be empty.');

        }
    }

    public function getValue(): string
    {
        return $this->value;
    }

}