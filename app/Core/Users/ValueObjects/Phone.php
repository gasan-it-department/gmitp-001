<?php

namespace App\Core\Users\ValueObjects;

use InvalidArgumentException;

class Phone
{

    private string $value;

    public function __construct(string $number)
    {
        $clean = preg_replace('/[^0-9]/', '', $number);

        // Normalize all variants to the 12-digit international format: 639XXXXXXXXX
        if (str_starts_with($clean, '09') && strlen($clean) === 11) {
            // 09XXXXXXXXX → 639XXXXXXXXX
            $clean = '63' . substr($clean, 1);
        } elseif (str_starts_with($clean, '9') && strlen($clean) === 10) {
            // 9XXXXXXXXX → 639XXXXXXXXX
            $clean = '63' . $clean;
        } elseif (str_starts_with($clean, '6309') && strlen($clean) === 13) {
            // 6309XXXXXXXXX → 639XXXXXXXXX
            $clean = '63' . substr($clean, 3);
        }

        if (!preg_match('/^639\d{9}$/', $clean)) {
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
     */
    public function toE164(): string
    {
        return '+' . $this->value;
    }
}