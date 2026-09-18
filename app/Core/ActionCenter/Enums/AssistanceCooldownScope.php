<?php

namespace App\Core\ActionCenter\Enums;

enum AssistanceCooldownScope: string
{
    case Beneficiary = 'per_beneficiary';
    case Household = 'per_household';

    public function label(): string
    {
        return match ($this) {
            self::Beneficiary => 'Beneficiary only',
            self::Household => 'Entire household',
        };
    }
}
