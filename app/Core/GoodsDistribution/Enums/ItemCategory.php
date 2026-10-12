<?php

namespace App\Core\GoodsDistribution\Enums;

enum ItemCategory: string
{
    case Food = 'food';
    case Hygiene = 'hygiene';
    case HouseholdSupplies = 'household_supplies';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Food => 'Food',
            self::Hygiene => 'Hygiene supplies',
            self::HouseholdSupplies => 'Household supplies',
            self::Other => 'Other',
        };
    }

    public static function options(): array
    {
        return array_map(fn (self $category) => ['value' => $category->value, 'label' => $category->label()], self::cases());
    }
}
