<?php

namespace App\Core\Cemetery\Enums;

enum PlotOccupancyMode: string
{
    case SINGLE = 'single';
    case SHARED = 'shared';
    case SLOTTED = 'slotted';

    public function label(): string
    {
        return match ($this) {
            self::SINGLE => 'Single Occupancy',
            self::SHARED => 'Shared Occupancy',
            self::SLOTTED => 'Slotted Container',
        };
    }
}
