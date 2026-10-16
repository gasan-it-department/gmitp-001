<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkCustodianType: string
{
    case Staff = 'staff';
    case BarangayOfficial = 'barangay_official';
    case OtherRepresentative = 'other_representative';

    public function label(): string
    {
        return match ($this) {
            self::Staff => 'Municipal / LGU staff',
            self::BarangayOfficial => 'Barangay official',
            self::OtherRepresentative => 'Other representative',
        };
    }

    public static function options(): array
    {
        return array_map(fn (self $type) => ['value' => $type->value, 'label' => $type->label()], self::cases());
    }
}
