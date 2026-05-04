<?php

namespace App\Core\ActionCenter\Enums;

enum CivilStatus: string
{

    case SINGLE = 'single';
    case MARRIED = 'married';
    case WIDOWED = 'widowed';
    case SEPARATED = 'separated';
    case ANNULED = 'annulled';

    public function label()
    {
        return match ($this) {
            self::SINGLE => 'Single',
            self::MARRIED => 'Married',
            self::WIDOWED => 'Widowed',
            self::SEPARATED => 'Separated',
            self::ANNULED => 'Anulled'
        };
    }

    public static function option()
    {
        return collect(self::cases())
            ->map(
                fn($case) => [
                    'label' => $case->label(),
                    'value' => $case->value,
                ]
            )->toArray();
    }

}