<?php

namespace App\Core\ActionCenter\Enums;

enum HouseholdReassignmentOperation: string
{
    case Correction = 'correction';
    case Transfer = 'transfer';
    case MoveOut = 'move_out';

    public function label(): string
    {
        return match ($this) {
            self::Correction => 'Correction',
            self::Transfer => 'Transfer',
            self::MoveOut => 'Moved out',
        };
    }

    public function isResidenceEvent(): bool
    {
        return match ($this) {
            self::Correction => false,
            self::Transfer, self::MoveOut => true,
        };
    }
}
