<?php

namespace App\Core\ActionCenter\Enums;

enum EducationalAttainment: string
{
    case NO_FORMAL_EDUCATION = 'no_formal_education';
    case ELEM_UNDERGRAD = 'elem_undergrad';
    case ELEM_GRADUATE = 'elem_grad';
    case HS_UNDERGRAD = 'hs_undergrad';
    case HS_GRADUATE = 'hs_grad';
    case SHS_UNDERGRAD = 'shs_undergrad';
    case SHS_GRADUATE = 'shs_grad';
    case COLLEGE_UNDERGRAD = 'college_undergrad';
    case COLLEGE_GRADUATE = 'college_grad';
    case VOCATIONAL = 'vocational';

    /**
     * Returns the human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::NO_FORMAL_EDUCATION => 'No Formal Education',
            self::ELEM_UNDERGRAD => 'Elem. Undergrad.',
            self::ELEM_GRADUATE => 'Elem. Graduate',
            self::HS_UNDERGRAD => 'H.S. Undergrad.',
            self::HS_GRADUATE => 'H.S. Graduate',
            self::SHS_UNDERGRAD => 'Senior H.S. Undergrad.',
            self::SHS_GRADUATE => 'Senior H.S. Graduate',
            self::COLLEGE_UNDERGRAD => 'College Undergrad.',
            self::COLLEGE_GRADUATE => 'College Graduate',
            self::VOCATIONAL => 'Vocational Training',
        };
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