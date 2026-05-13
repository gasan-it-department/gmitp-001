<?php

namespace App\Core\ActionCenter\Enums;

enum Relationship: string
{
    case Spouse = 'spouse';
    case Parent = 'parent';
    case Child = 'child';    // must be 18+
    case Sibling = 'sibling';  // must be 18+

    case Bading = 'bading';

    public function label(): string
    {
        return match ($this) {
            self::Spouse => 'Spouse',
            self::Parent => 'Parent',
            self::Child => 'Son / Daughter',
            self::Sibling => 'Brother / Sister',
            self::Bading => 'bading nga'
        };
    }

    /** Relationships that require the filer to be of legal age (18+). */
    public function requiresLegalAge(): bool
    {
        return match ($this) {
            self::Child, self::Sibling => true,
            default => false,
        };
    }

    public static function toOptions()
    {
        return collect(self::cases())
            ->map(fn($cases) => [
                'label' => $cases->label(),
                'value' => $cases->value,
            ])
            ->toArray();
    }
}