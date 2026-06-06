<?php

namespace App\Core\CommunityReport\Enums;

enum ReportCategory: string
{
    case POTHOLE = 'pothole';
    case STREETLIGHT = 'streetlight';
    case WATER_LEAK = 'water_leak';
    case GARBAGE = 'garbage';
    case DRAINAGE = 'drainage';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::POTHOLE => 'Pothole',
            self::STREETLIGHT => 'Broken Streetlight',
            self::WATER_LEAK => 'Water Leak',
            self::GARBAGE => 'Garbage / Waste',
            self::DRAINAGE => 'Drainage Issue',
            self::OTHER => 'Other',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
