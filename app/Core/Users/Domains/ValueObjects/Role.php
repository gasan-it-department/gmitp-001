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

    public function value(): string
    {
        return $this->value->value;
    }

}