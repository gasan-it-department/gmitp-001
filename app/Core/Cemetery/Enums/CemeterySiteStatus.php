<?php

namespace App\Core\Cemetery\Enums;

enum CemeterySiteStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
            self::CLOSED => 'Closed',
        };
    }
}
