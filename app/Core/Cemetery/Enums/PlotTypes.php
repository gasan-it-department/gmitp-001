<?php

namespace App\Core\Cemetery\Enums;

/**
 * Physical category of a cemetery plot. Aligned with the LGU scope doc:
 *  - Ground / Lawn Lots
 *  - Apartment Niches
 *  - Bone Ossuaries
 *  - Mausoleums
 */
enum PlotTypes: string
{
    case LAWN_LOT = 'lawn_lot';
    case APARTMENT_NICHE = 'apartment_niche';
    case BONE_OSSUARY = 'bone_ossuary';
    case MAUSOLEUM = 'mausoleum';

    public function label(): string
    {
        return match ($this) {
            self::LAWN_LOT => 'Ground / Lawn Lot',
            self::APARTMENT_NICHE => 'Apartment Niche',
            self::BONE_OSSUARY => 'Bone Ossuary',
            self::MAUSOLEUM => 'Mausoleum',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function toOptions(): array
    {
        return collect(self::cases())
            ->map(fn (self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ])
            ->toArray();
    }
}
