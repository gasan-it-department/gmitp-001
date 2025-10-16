<?php

namespace App\Core\Users\Domains\ValueObjects;

use InvalidArgumentException;

final class LastName
{
    private string $value;

    public function __construct(string $value)
    {
        $value = trim($value);

        if ($value === '') {
            throw new InvalidArgumentException('Last name cannot be empty.');
        }

        if (strlen($value) > 100) {
            throw new InvalidArgumentException('Last name cannot exceed to 100 characters.');
        }

        if (!preg_match('/^[a-zA-Z\s\-]+$/u', $value)) {
            throw new InvalidArgumentException('Last name contains invalid characters.');
        }

        $this->value = $this->format($value);
    }

    private function format(string $value): string
    {
        return ucwords(strtolower($value));
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(LastName $other): bool
    {
        return $this->value === $other->value;
    }

    public function __tooString(): string
    {
        return $this->value;
    }
}