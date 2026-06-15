<?php

namespace App\Core\Cemetery\Enums;

enum IdentityStatus: string
{
    case IDENTIFIED = 'identified';
    case UNIDENTIFIED = 'unidentified';

    public function label(): string
    {
        return match ($this) {
            self::IDENTIFIED => 'Identified',
            self::UNIDENTIFIED => 'Unidentified',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], self::cases());
    }
}
