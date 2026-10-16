<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkDispatchPurpose: string
{
    case CommunityDistribution = 'community_distribution';
    case HomeDelivery = 'home_delivery';
    case SchoolDistribution = 'school_distribution';
    case EmergencyRelief = 'emergency_relief';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::CommunityDistribution => 'Barangay / Community distribution',
            self::HomeDelivery => 'Home delivery / Outreach',
            self::SchoolDistribution => 'School distribution',
            self::EmergencyRelief => 'Emergency / Disaster relief',
            self::Other => 'Other',
        };
    }

    public static function options(): array
    {
        return array_map(fn (self $purpose) => ['value' => $purpose->value, 'label' => $purpose->label()], self::cases());
    }
}
