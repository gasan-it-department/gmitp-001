<?php

namespace App\Core\Users\Domains\ValueObjects;

use InvalidArgumentException;

final class MiddleName
{
    private ?string $value;

    public function __construct(?string $value)
    {
        if ($value === null || trim($value) === '') {
            $this->value = null;
            return;
        }

        $value = trim($value);

        if (!preg_match('/^[a-zA-Z\s\'\-\.]+$/u', $value)) {
            throw new InvalidArgumentException('Middle name contains invalid characters');
        }

        $this->value = mb_convert_case($value, MB_CASE_TITLE, "UTF-8");
    }

    public function value(): ?string
    {
        return $this->value;
    }

    public function initial(): ?string
    {
        if (!$this->value) {

            return null;
        }

        $words = preg_split('/\s+/', $this->value);
        $initials = array_map(fn($word) => mb_substr($word, 0, 1) . '.', $words);

        return implode('', $initials);
    }

    public function equals(MiddleName $other): bool
    {
        return strtolower($this->value ?? '') === strtolower($other->value ?? '');
    }

    public function __tosString(): string
    {
        return $this->value ?? '';
    }
}