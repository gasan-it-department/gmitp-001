<?php

namespace App\Core\ActionCenter\Enums;

enum EducationalAttainment: string
{
    case ILLITERATE = 'Illiterate';
    case ELEM_UNDERGRAD = 'Elem. Undergrad.';
    case ELEM_GRADUATE = 'Elem. Graduate';
    case HS_UNDERGRAD = 'H.S. Undergrad.';
    case HS_GRADUATE = 'H.S. Graduate';
    case SHS_UNDERGRAD = 'Senior H.S. Undergrad.';
    case SHS_GRADUATE = 'Senior H.S. Graduate';
    case COLLEGE_UNDERGRAD = 'College Undergrad.';
    case COLLEGE_GRADUATE = 'College Graduate';
    case VOCATIONAL = 'Vocational Training';

    /**
     * Returns the human-readable label.
     */
    public function label(): string
    {
        // Since your backing values (the strings on the right) are already 
        // human-readable, we can just return the value itself.
        return $this->value;
    }

    /**
     * Transforms the enum into an array for frontend dropdowns.
     */
    public static function toOptions(): array
    {
        return array_map(fn(self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}