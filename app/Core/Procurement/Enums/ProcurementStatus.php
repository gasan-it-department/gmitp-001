<?php

namespace App\Core\Procurement\Enums;

enum ProcurementStatus: string
{
    case DRAFT = 'Draft';
    case OPEN = 'Open';
    case EVALUATING = 'Evaluating'; // Post-qualification phase
    case AWARDED = 'Awarded';
    case FAILED = 'Failed';
    case CANCELLED = 'Cancelled';

    // Bonus: You can add helper methods directly in the Enum for your React frontend!
    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'text-gray-500 bg-gray-100',
            self::OPEN => 'text-blue-700 bg-blue-100',
            self::AWARDED => 'text-green-700 bg-green-100',
            self::FAILED, self::CANCELLED => 'text-red-700 bg-red-100',
            default => 'text-gray-700 bg-gray-100',
        };
    }

}