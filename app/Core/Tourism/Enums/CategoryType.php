<?php
namespace App\Core\Tourism\Enums;

enum CategoryType: string
{
    case SPOT = 'spot';
    case ESTABLISHMENT = 'establishment';
    case EVENT = 'event';
    case HERITAGE = 'heritage';

    public static function getDropdownOptions(): array
    {
        return [
            ['value' => self::SPOT->value, 'label' => 'Tourist Spot'],
            ['value' => self::ESTABLISHMENT->value, 'label' => 'Establishment'],
            ['value' => self::EVENT->value, 'label' => 'Event / Festival'],
            ['value' => self::HERITAGE->value, 'label' => 'Cultural Heritage'],
        ];
    }
}