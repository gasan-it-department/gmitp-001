<?php

namespace App\Core\Users\Domains\ValueObjects;

use App\Core\Users\Domains\Enum\EnumRoles;

class Role
{
    public function __construct(private EnumRoles $value)
    {
    }

    public static function from(string $role): self
    {
        return new self(EnumRoles::fromString($role));
    }

    public function getValue(): string
    {
        return $this->value->value;
    }

    public function label(): string
    {
        return $this->value->label();
    }
    public function getEnum(): EnumRoles
    {
        return $this->value;
    }

    public function equals(Role $other): bool
    {
        return $this->value === $other->value;
    }

}