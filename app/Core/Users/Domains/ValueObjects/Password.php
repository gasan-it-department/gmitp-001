<?php

namespace App\Core\Users\Domains\ValueObjects;

class Password
{

    private string $value;

    public function __construct(string $value)
    {
        $this->setValue($value);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    private function setValue(string $value): void
    {
        $this->value = $value;
    }
}
