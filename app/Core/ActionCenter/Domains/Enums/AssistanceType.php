<?php

namespace App\Core\ActionCenter\Domains\Enums;

enum AssistanceType
{
    case FINANCIAL = 'financial';
    case FOOD = 'food';
    case BURIAL = 'burial';
    case MEDICAL = 'medical';
    case TRASNSPORTATION = 'transportation';

    public function assistanceLabel(): string
    {
        return match ($this) {
            AssistanceType::FINANCIAL => 'Financial Assistance',
            AssistanceType::FOOD => 'Food Assistance',
            AssistanceType::BURIAL => 'Burial Assistance',
            AssistanceType::MEDICAL => 'Medical Assistance',
        };
    }


}
