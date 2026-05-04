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
}