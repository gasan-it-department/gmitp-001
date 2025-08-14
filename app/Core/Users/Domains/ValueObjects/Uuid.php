<?php

namespace App\Core\Users\Domains\ValueObjects;
use Ramsey\Uuid\Uuid as RamseyUuid;

final class Uuid
{
    public function __Construct(private string $value)
    {
        if (!RamseyUuid::isValid($value)) {
            throw new \InvalidArgumentException("Invalid UUID");
        }
    }

    public static function generate(): self
    {
        return new self(
            RamseyUuid::uuid4()->toString()
        );
    }

    public static function fromString(string $uuid): self
    {
        return new self($uuid);
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    public function getValue(): string
    {
        return $this->value;
    }
}