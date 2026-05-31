<?php

namespace App\Core\Municipality\Enums;

enum HotlineCategory: string
{
    case MEDICAL = 'medical';
    case SECURITY = 'security';
    case RESCUE = 'rescue';
    case UTILITY = 'utility';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::MEDICAL => 'Medical',
            self::SECURITY => 'Security',
            self::RESCUE => 'Rescue',
            self::UTILITY => 'Utility',
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
