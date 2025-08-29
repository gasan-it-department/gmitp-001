<?php

namespace App\Core\Users\Domains\ValueObjects;

use App\Core\Users\Domains\Exceptions\InvalidUserNameExceptions;
final readonly class UserName
{
    private const MIN_LENGTH = 3;
    private const MAX_LENGTH = 100;
    private const ALLOWED_CHARACTERS = '/^[a-zA-Z0-9_ ]+$/';

    public function __construct(private string $value)
    {
        $this->validate($value);
    }
    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(UserName $other): bool
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
            throw InvalidUserNameExceptions::empty();
        }

        if (strlen($trimmed) < self::MIN_LENGTH) {
            throw InvalidUserNameExceptions::tooShort(self::MIN_LENGTH);
        }

        if (strlen($trimmed) > self::MAX_LENGTH) {
            throw InvalidUserNameExceptions::tooLong(self::MAX_LENGTH);
        }

        if (str_contains($value, ' ')) {
            throw InvalidUserNameExceptions::containsSpaces();
        }

        if (!preg_match('/^[a-zA-Z0-9_]+$/', $trimmed)) {
            throw InvalidUserNameExceptions::invalidCharacters();
        }


    }

}

