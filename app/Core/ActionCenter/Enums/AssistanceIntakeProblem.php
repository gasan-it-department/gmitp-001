<?php

namespace App\Core\ActionCenter\Enums;

enum AssistanceIntakeProblem: string
{
    case Sick = 'sick';
    case InadequateFinances = 'inadequate_finances';
    case HelplessToBuryDead = 'helpless_to_bury_dead';
    case SeekingMedicalAssistance = 'seeking_medical_assistance';

    public function label(): string
    {
        return match ($this) {
            self::Sick => 'Sick',
            self::InadequateFinances => 'Inadequate Finances',
            self::HelplessToBuryDead => 'Helpless to Bury Dead',
            self::SeekingMedicalAssistance => 'Seeking Medical Assistance',
        };
    }

    /** @return array<int, array{value: string, label: string}> */
    public static function options(): array
    {
        return array_map(
            fn (self $problem): array => [
                'value' => $problem->value,
                'label' => $problem->label(),
            ],
            self::cases(),
        );
    }
}
