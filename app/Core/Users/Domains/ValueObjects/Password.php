<?php

namespace App\Core\Users\Domains\ValueObjects;

use App\Core\Users\Domains\Exceptions\InvalidPasswordExceptions;
final readonly class Password
{

    private const MIN_LENGTH = 8;


    public function __construct(
        private string $value
    ) {
        $this->validate($value);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function verify(string $password): bool
    {
        return password_verify($password, $this->value);
    }

    public function __toString(): string
    {
        return $this->value;
    }

    private function validate(string $value): void
    {
        if (empty($value)) {
            throw InvalidPasswordExceptions::empty();
        }

        if (strlen($value) < self::MIN_LENGTH) {
            throw InvalidPasswordExceptions::tooShort(self::MIN_LENGTH);
        }

        // if (str_contains($value, ' ')) {
        //     throw InvalidPasswordExceptions::containsSpaces();
        // }

        // if (!preg_match('/[A-Z]/', $value)) {
        //     throw InvalidPasswordExceptions::missingUppercase();
        // }

        // if (!preg_match('/\d/', $value)) {
        //     throw InvalidPasswordExceptions::missingNumber();
        // }
    }
}
