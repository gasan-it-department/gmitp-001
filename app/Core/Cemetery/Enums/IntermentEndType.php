<?php

namespace App\Core\Cemetery\Enums;

enum IntermentEndType: string
{
    case MOVED = 'moved';
    case EXHUMED = 'exhumed';
    case TRANSFERRED_OUT = 'transferred_out';

    public function label(): string
    {
        return match ($this) {
            self::MOVED => 'Moved Out',
            self::EXHUMED => 'Exhumed',
            self::TRANSFERRED_OUT => 'Transferred Out',
        };
    }
}
