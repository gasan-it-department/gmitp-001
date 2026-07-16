<?php

namespace App\Core\ActionCenter\Enums;

enum HeadDepartureDisposition: string
{
    case RemainsMember = 'remains_member';
    case MovedOut = 'moved_out';
    case Deceased = 'deceased';
    case Inactive = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::RemainsMember => 'Remains in the household',
            self::MovedOut => 'Moved out',
            self::Deceased => 'Deceased',
            self::Inactive => 'Inactive record',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn (self $disposition) => [
                'value' => $disposition->value,
                'label' => $disposition->label(),
            ],
            self::cases(),
        );
    }
}
