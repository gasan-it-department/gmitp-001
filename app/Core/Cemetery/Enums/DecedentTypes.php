<?php

namespace App\Core\Cemetery\Enums;

enum DecedentTypes: string
{

    case STANDARD = 'standard';
    case FETAL = 'fetal';
    case CHILD = 'child';
    case UNKNOWN = 'unknown';

    public function label(): string
    {

        return match ($this) {
            self::STANDARD => 'Standard',
            self::FETAL => 'Fetal',
            self::CHILD => 'Child',
            self::UNKNOWN => 'Unknown'
        };

    }


}