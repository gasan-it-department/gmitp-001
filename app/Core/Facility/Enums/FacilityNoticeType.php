<?php

namespace App\Core\Facility\Enums;

enum FacilityNoticeType: string
{
    case SPECIAL_HOURS = 'special_hours';
    case CLOSED = 'closed';
    case CANCELLED = 'cancelled';
    case DELAYED = 'delayed';

    public function closesDay(): bool
    {
        return in_array($this, [self::CLOSED, self::CANCELLED], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::SPECIAL_HOURS => 'Special hours', self::CLOSED => 'Closed',
            self::CANCELLED => 'Cancelled', self::DELAYED => 'Confirmed later opening',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $type) => ['value' => $type->value, 'label' => $type->label()], self::cases());
    }
}
