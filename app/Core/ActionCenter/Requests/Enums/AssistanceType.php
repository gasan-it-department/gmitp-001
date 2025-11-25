<?php

namespace App\Core\ActionCenter\Domains\Enums;

enum AssistanceType: string
{
    case FINANCIAL = 'financial';
    case FOOD = 'food';
    case BURIAL = 'burial';
    case MEDICAL = 'medical';
    case TRANSPORTATION = 'transportation';

    public function assistanceLabel(): string
    {
        return match ($this) {
            self::FINANCIAL => 'Financial Assistance',
            self::FOOD => 'Food Assistance',
            self::BURIAL => 'Burial Assistance',
            self::MEDICAL => 'Medical Assistance',
            self::TRANSPORTATION => 'Transportation Assistance',
        };
    }


}
