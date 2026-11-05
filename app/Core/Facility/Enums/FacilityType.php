<?php

namespace App\Core\Facility\Enums;

enum FacilityType: string
{
    case PARK = 'park';
    case PLAYGROUND = 'playground';
    case AMUSEMENT_RIDE = 'amusement_ride';
    case SPORTS_FACILITY = 'sports_facility';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::PARK => 'Park', self::PLAYGROUND => 'Playground',
            self::AMUSEMENT_RIDE => 'Amusement ride', self::SPORTS_FACILITY => 'Sports facility', self::OTHER => 'Other',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $type) => ['value' => $type->value, 'label' => $type->label()], self::cases());
    }
}
