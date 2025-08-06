<?php

namespace App\Core\Users\Domains\ValueObjects;

class UserName
{
    private const MIN_LENGTH = 3;
    private const MAX_LENGTH = 20;
    private const ALLOWED_CHARACTERS = '/^[a-zA-Z0-9_ ]+$/';

    private string $value;

    public function __construct(string $value)
    {
        $this->setValue($value);
    }

    private function setValue(string $value): void
    {
        if (strlen($value) < self::MIN_LENGTH || strlen($value) > self::MAX_LENGTH) {
            throw new \InvalidArgumentException('Username must be between ' . self::MIN_LENGTH . ' and ' . self::MAX_LENGTH . ' characters.');
        }

        if (!preg_match(self::ALLOWED_CHARACTERS, $value)) {
            throw new \InvalidArgumentException('Username can only contain alphanumeric characters and underscores.');
        }

        $this->value = $value;
    }

    public function getValue(): string
    {
        return $this->value;
    }

}

