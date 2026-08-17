<?php

namespace App\Core\ActionCenter\Enums;

enum Relationship: string
{
    /**
     * The registered citizen themselves — used for the self-referencing
     * ac_household_members row that CreateBeneficiaryProfileAction writes
     * alongside the beneficiary. Only one Head per household; the action
     * layer enforces that invariant. This case is intentionally NOT shown
     * in the citizen-facing relationship dropdown (server-managed only).
     */
    case Head = 'head';

    case Spouse = 'spouse';
    case LiveInPartner = 'live_in_partner';
    case Parent = 'parent';
    case Child = 'child';    // must be 18+
    case Sibling = 'sibling';  // must be 18+
    case Grandparent = 'grandparent';
    case Grandchild = 'grandchild';
    case ParentInLaw = 'parent_in_law';
    case ChildInLaw = 'child_in_law';
    case AuntUncle = 'aunt_uncle';
    case NieceNephew = 'niece_nephew';
    case Cousin = 'cousin';
    case Guardian = 'guardian';
    case Ward = 'ward';
    case OtherRelative = 'other_relative';
    case NonRelative = 'non_relative';

    public function label(): string
    {
        return match ($this) {
            self::Head => 'Head of Household',
            self::Spouse => 'Spouse',
            self::LiveInPartner => 'Live-in Partner',
            self::Parent => 'Parent',
            self::Child => 'Son / Daughter',
            self::Sibling => 'Brother / Sister',
            self::Grandparent => 'Grandparent',
            self::Grandchild => 'Grandson / Granddaughter',
            self::ParentInLaw => 'Parent-in-law',
            self::ChildInLaw => 'Son / Daughter-in-law',
            self::AuntUncle => 'Aunt / Uncle',
            self::NieceNephew => 'Niece / Nephew',
            self::Cousin => 'Cousin',
            self::Guardian => 'Guardian',
            self::Ward => 'Ward / Person under guardianship',
            self::OtherRelative => 'Other Relative',
            self::NonRelative => 'Non-relative Household Member',
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
     * Drives household composition selectors across citizen and admin intake.
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
            // Head is server-managed (assigned automatically to the registered
            // citizen). Hide it from the citizen-facing dropdown — they can
            // never pick "Head" for another household member.
            ->reject(fn(self $case) => $case === self::Head)
            ->map(fn(self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
                'requires_legal_age' => $case->requiresLegalAge(),
            ])
            ->values()
            ->toArray();
    }

    /**
     * Relationships currently allowed to file for another person under the
     * Action Center assistance rules. Household composition is intentionally
     * broader than this list.
     *
     * @return array<int, self>
     */
    public static function assistanceRepresentativeCases(): array
    {
        return [
            self::Spouse,
            self::Parent,
            self::Child,
            self::Sibling,
        ];
    }

    /** @return array<int, string> */
    public static function assistanceRepresentativeValues(): array
    {
        return array_map(
            fn(self $case) => $case->value,
            self::assistanceRepresentativeCases(),
        );
    }

    /** @return array<int, array{value: string, label: string, requires_legal_age: bool}> */
    public static function assistanceRepresentativeOptions(): array
    {
        return array_map(
            fn(self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
                'requires_legal_age' => $case->requiresLegalAge(),
            ],
            self::assistanceRepresentativeCases(),
        );
    }
}
