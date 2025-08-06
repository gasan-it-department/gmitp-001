<?php

namespace App\Core\Users\Domains\ValueObjects;

class Phone
{
    private string $number;

    public function __construct(string $number)
    {
        $this->setNumber($number);
    }

    public function getValue(): string
    {
        return $this->number;
    }

    private function setNumber(string $number): void
    {
        // Here you can add validation for phone number format
        $this->number = $number;
    }
}