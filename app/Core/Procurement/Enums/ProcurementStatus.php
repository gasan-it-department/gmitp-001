<?php

namespace App\Core\Procurement\Enums;

enum ProcurementStatus: string
{
    case DRAFT = 'draft';
    case OPEN = 'open';
    case EVALUATING = 'evaluating'; // Post-qualification phase
    case AWARDED = 'awarded';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';

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

    public function label()
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::OPEN => 'Open (Bidding Ongoing)',
            self::EVALUATING => 'Evaluating (Post-Qualification)',
            self::AWARDED => 'Awarded',
            self::FAILED => 'Failed Bidding',
            self::CANCELLED => 'Cancelled',
        };
    }

    public static function toSelectOptions(): array
    {
        return array_map(fn(self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'color' => $case->color(),
        ], ProcurementStatus::cases());
    }

}