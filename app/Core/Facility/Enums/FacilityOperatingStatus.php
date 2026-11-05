<?php

namespace App\Core\Facility\Enums;

enum FacilityOperatingStatus: string
{
    case FOLLOWING_SCHEDULE = 'following_schedule';
    case DELAYED = 'delayed';
    case TEMPORARILY_CLOSED = 'temporarily_closed';
    case PERMANENTLY_CLOSED = 'permanently_closed';

    public function label(): string
    {
        return match ($this) {
            self::FOLLOWING_SCHEDULE => 'Following schedule', self::DELAYED => 'Delayed',
            self::TEMPORARILY_CLOSED => 'Temporarily closed', self::PERMANENTLY_CLOSED => 'Permanently closed',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $status) => ['value' => $status->value, 'label' => $status->label()], self::cases());
    }
}
