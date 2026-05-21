<?php

namespace App\Core\Cemetery\Enums;

/**
 * Real-time availability state of a plot. Drives the inventory filter
 * (REQ-2.2) and is auto-flipped by interment / exhumation use cases.
 */
enum PlotStatus: string
{
    case AVAILABLE = 'available';
    case OCCUPIED = 'occupied';
    case RESERVED = 'reserved';
    case MAINTENANCE = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::OCCUPIED => 'Occupied',
            self::RESERVED => 'Reserved',
            self::MAINTENANCE => 'Under Maintenance',
        };
    }

    /**
     * Tailwind colour token used by the frontend status pill.
     */
    public function tone(): string
    {
        return match ($this) {
            self::AVAILABLE => 'emerald',
            self::OCCUPIED => 'rose',
            self::RESERVED => 'amber',
            self::MAINTENANCE => 'slate',
        };
    }

    /**
     * @return array<int, array{value: string, label: string, tone: string}>
     */
    public static function toOptions(): array
    {
        return collect(self::cases())
            ->map(fn (self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
                'tone' => $case->tone(),
            ])
            ->toArray();
    }
}
