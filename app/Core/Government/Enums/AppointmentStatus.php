<?php

namespace App\Core\Government\Enums;

enum AppointmentStatus: string
{

    case ACTIVE = 'active';
    case RESIGNED = 'resigned';
    case PROMOTED = 'promoted';
    case DECEASED = 'deceased';
    case REMOVED = 'removed';
    case OTHERS = 'others';

    public static function labels(): array
    {
        return [
            self::RESIGNED->value => 'Resigned',
            self::PROMOTED->value => 'Promoted / Transfered',
            self::DECEASED->value => 'Deceased',
            self::REMOVED->value => 'Removed from Office',
            self::OTHERS->value => 'Others',
        ];
    }

}