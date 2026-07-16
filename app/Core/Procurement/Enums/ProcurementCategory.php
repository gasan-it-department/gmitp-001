<?php

namespace App\Core\Procurement\Enums;

enum ProcurementCategory: string
{
    // The Big 3 (RA 9184 Macros)
    case GOODS = 'goods';
    case INFRASTRUCTURE = 'infrastructure';
    case CONSULTING = 'consulting';

    // Sub-categories (For better UI filtering)
    case FURNITURE_AND_FIXTURES = 'furniture_and_fixtures';
    case OFFICE_SUPPLIES = 'office_supplies';
    case OFFICE_EQUIPMENT = 'office_equipment'; // Split for clarity, or combine if you prefer
    case VEHICLES = 'vehicles';
    case MEDICAL_SUPPLIES = 'medical_supplies';
    case OTHERS = 'others';

    public function label(): string
    {
        return match ($this) {
            self::GOODS => 'Goods',
            self::INFRASTRUCTURE => 'Infrastructure Projects',
            self::CONSULTING => 'Consulting Services',

            self::FURNITURE_AND_FIXTURES => 'Furniture & Fixtures',
            self::OFFICE_SUPPLIES => 'Office Supplies',
            self::OFFICE_EQUIPMENT => 'Office Equipment',
            self::VEHICLES => 'Vehicles & Transportation',
            self::MEDICAL_SUPPLIES => 'Medical & Laboratory Supplies',
            self::OTHERS => 'Others',
        };
    }

    public static function toSelectOption(): array
    {
        return array_map(fn(self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases()); // You can just use self::cases() instead of ProcurementCategory::cases()
    }
}