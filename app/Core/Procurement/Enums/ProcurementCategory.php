<?php

namespace App\Core\Procurement\Enums;

enum ProcurementCategory: string
{
    case GOODS = 'goods';
    case SERVICES = 'services';
    case CONSULTING = 'consulting';
    case INFRASTRUCTURE = 'infrastructure';
    case IT_EQUIPMENT = 'it_equipment';
    case OFFICE_SUPPLIES = 'office_supplies';
    case VEHICLES = 'vehicles';
    case MEDICAL_SUPPLIES = 'medical_supplies';
    case OTHERS = 'others';

    // Optional: You can add a method to get a human-readable label
    public function label(): string
    {
        return match ($this) {
            self::GOODS => 'Goods',
            self::SERVICES => 'General Services',
            self::CONSULTING => 'Consulting Services',
            self::INFRASTRUCTURE => 'Infrastructure Projects',
            self::IT_EQUIPMENT => 'IT Equipment & Software',
            self::OFFICE_SUPPLIES => 'Office Supplies',
            self::VEHICLES => 'Vehicles & Transportation',
            self::MEDICAL_SUPPLIES => 'Medical & Laboratory Supplies',
            self::OTHERS => 'Others',
        };
    }

    public static function toSelectOption()
    {
        return array_map(fn(self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], ProcurementCategory::cases());
    }
}