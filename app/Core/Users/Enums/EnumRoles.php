<?php

namespace App\Core\Users\Enums;

enum EnumRoles: string
{
    case CLIENT = 'client';

    case ADMIN = 'admin';

    case SUPER_ADMIN = 'super_admin';

    public static function fromString(string $value): self
    {
        return match ($value) {
            'client' => self::CLIENT,
            'admin' => self::ADMIN,
            'super_admin' => self::SUPER_ADMIN,
            default => throw new \InvalidArgumentException("Invalid role value: $value"),
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::CLIENT => 'Client',
            self::ADMIN => 'Admin',
            self::SUPER_ADMIN => 'Super Admin',
        };
    }
}