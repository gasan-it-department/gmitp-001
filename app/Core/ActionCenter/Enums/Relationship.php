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

    /**
     * Drives the relationship selector on the citizen Apply form.
     *
     * Returns one row per enum case in display order:
     *   - value              → submitted in the request payload
     *   - label              → button text shown to the citizen
     *   - requires_legal_age → drives the "Must be 18+" pill and the
     *                          under-age guard on the frontend, so the
     *                          legal-age rule is sourced from this enum
     *                          (single source of truth) instead of being
     *                          duplicated client-side.
     *
     * @return array<int, array{value: string, label: string, requires_legal_age: bool}>
     */
    public static function toOptions(): array
    {
        return collect(self::cases())
            ->map(fn (self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
                'requires_legal_age' => $case->requiresLegalAge(),
            ])
            ->toArray();
    }
}