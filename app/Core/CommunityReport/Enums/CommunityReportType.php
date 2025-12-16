<?php

namespace App\Core\CommunityReport\Enums;

enum CommunityReportType: string
{
    case STREET_LIGHT = 'street_light';
    case ROAD_DAMAGE = 'road_damage';
    case GARBAGE = 'garbage';
    case WATER_LEAK = 'water_leak';
    case OBSTRUCTION = 'obstruction';
    case VANDALISM = 'vandalism';
    case OTHERS = 'others';

    // Helper for displaying nice text in your React Dropdown/Table
    public function label(): string
    {
        return match ($this) {
            self::STREET_LIGHT => 'Street Light',
            self::ROAD_DAMAGE => 'Road or Pavement Damage',
            self::GARBAGE => 'Uncollected Garbage / Trash',
            self::WATER_LEAK => 'Water Leak / Pipe Burst',
            self::OBSTRUCTION => 'Obstruction',
            self::VANDALISM => 'Vandalism / Graffiti',
            self::OTHERS => 'Other Concerns',
        };
    }

    // Optional: Helper for UI Badge colors
    public function color(): string
    {
        return match ($this) {
            self::STREET_LIGHT, self::WATER_LEAK => 'blue',
            self::ROAD_DAMAGE, self::OBSTRUCTION => 'orange',
            self::GARBAGE, self::VANDALISM => 'red',
            default => 'gray',
        };
    }
}