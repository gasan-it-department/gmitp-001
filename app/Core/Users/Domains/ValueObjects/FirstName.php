<?php

namespace App\Core\Users\Domains\ValueObjects;

use InvalidArgumentException;

final class FirstName
{
    private string $value;

    public function __construct(string $value)
    {
        $value = trim($value);

        if ($value === '') {
            throw new InvalidArgumentException('First name cannot be empty');
        }

        if (!preg_match('/^[a-zA-Z\s\'\-]+$/u', $value)) {
            throw new InvalidArgumentException('First name contains invalid characters');
        }

        $this->value = $value;
    }


    public function value(): string
    {
        return $this->value;
    }

    public function formatted(): string
    {
        return mb_convert_case($this->value, MB_CASE_TITLE, "UTF-8");
    }

    public function equals(FirstName $other): bool
    {
        return mb_strtolower($this->value) === mb_strtolower($other->value());
    }

    public function __toString(): string
    {
        return $this->formatted();
    }
}