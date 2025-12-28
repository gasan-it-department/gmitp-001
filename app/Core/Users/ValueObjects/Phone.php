<?php

namespace App\Core\Users\ValueObjects;

use InvalidArgumentException;

class Phone
{

    private string $value;

    public function __construct(string $number)
    {

        $clean = preg_replace('/[^0-9+]/', '', $number);

        if (str_starts_with($clean, '09')) {

            $clean = '+63' . substr($clean, 1);

        } elseif (str_starts_with($clean, '639')) {
            $clean = '+' . $clean;
        } elseif (str_starts_with($clean, '9') && strlen($clean) === 10) {
            $clean = '+63' . $clean;
        }

        if (!preg_match('/^\+639\d{9}$/', $clean)) {
            throw new InvalidArgumentException("Invalid PH phone number format: {$number}");
        }

        $this->value = $clean;

    }

    public function toString()
    {
        return $this->value;
    }


    public function __toString()
    {
        return $this->value;
    }

    public function getValue()
    {

        return $this->value;

    }
}