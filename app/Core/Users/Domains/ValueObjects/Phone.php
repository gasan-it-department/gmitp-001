<?php

namespace App\Core\Users\Domains\ValueObjects;

use App\Core\Users\Domains\Exceptions\InvalidPhoneExceptions;
final readonly class Phone
{
    private const MIN_DIGITS = 10;
    private const MAX_DIGITS = 15;
    public function __construct(
        private string $value
    ) {
        $this->validate($value);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(Phone $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    private function validate(string $value): void
    {
        $trimmed = trim($value);

        if (empty($trimmed)) {
            throw InvalidPhoneExceptions::empty();
        }

        // Check for valid format (only digits and optional + at start)
        if (!preg_match('/^\+?\d+$/', $trimmed)) {
            throw InvalidPhoneExceptions::invalidFormat();
        }

        // Extract just the digits to check length
        $digits = preg_replace('/[^\d]/', '', $trimmed);
        $digitCount = strlen($digits);

        if ($digitCount < self::MIN_DIGITS || $digitCount > self::MAX_DIGITS) {
            throw InvalidPhoneExceptions::invalidLength();
        }
    }
}