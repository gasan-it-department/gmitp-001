<?php

namespace App\Core\Users\ValueObjects;

use InvalidArgumentException;

class Phone
{

    private string $value;

    public function __construct(string $number)
    {
        $clean = preg_replace('/[^0-9]/', '', $number);

        // Normalize all variants to the 11-digit local format: 09XXXXXXXXX
        if (str_starts_with($clean, '639') && strlen($clean) === 12) {
            // 639XXXXXXXXX → 09XXXXXXXXX
            $clean = '0' . substr($clean, 2);
        } elseif (str_starts_with($clean, '9') && strlen($clean) === 10) {
            // 9XXXXXXXXX → 09XXXXXXXXX
            $clean = '0' . $clean;
        }

        if (!preg_match('/^09\d{9}$/', $clean)) {
            throw new InvalidArgumentException("Invalid PH phone number format: {$number}");
        }

        $this->value = $clean;
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    /**
     * Returns the E.164 format (+639XXXXXXXXX) for use with SMS gateway APIs.
     * Do NOT store this — only use it at the point of the API call.
     */
    public function toE164(): string
    {
        return '+63' . substr($this->value, 1);
    }
}