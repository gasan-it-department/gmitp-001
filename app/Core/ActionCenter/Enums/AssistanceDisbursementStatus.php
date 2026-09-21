<?php

namespace App\Core\ActionCenter\Enums;

enum AssistanceDisbursementStatus: string
{
    case Preparing = 'preparing';
    case Ready = 'ready';
    case Released = 'released';
    case Voided = 'voided';

    public function label(): string
    {
        return match ($this) {
            self::Preparing => 'Preparing',
            self::Ready => 'Ready for Claim',
            self::Released => 'Released',
            self::Voided => 'Voided',
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Preparing, self::Ready], true);
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $status): string => $status->value, self::cases());
    }
}
