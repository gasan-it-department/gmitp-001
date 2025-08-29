<?php

namespace App\Core\Users\Domains\Enum;

enum EnumRoles: string
{
    case CLIENT = '0';
    case ADMIN = '1';
    case SUPER_ADMIN = '2';

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