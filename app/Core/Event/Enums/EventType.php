<?php

namespace App\Core\Event\Enums;

enum EventType: string
{
    case FESTIVAL = 'festival';
    case GOVERNMENT = 'government';
    case COMMUNITY = 'community';
    case HOLIDAY = 'holiday';

    public function label(): string
    {
        return match ($this) {
            self::FESTIVAL => 'Festival',
            self::GOVERNMENT => 'Government',
            self::COMMUNITY => 'Community',
            self::HOLIDAY => 'Holiday',
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
