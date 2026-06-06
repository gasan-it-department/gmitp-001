<?php

namespace App\Core\Announcement\Enums;

enum AnnouncementType: string
{
    case EMERGENCY = 'emergency';
    case ADVISORY = 'advisory';
    case UTILITY_INTERRUPTION = 'utility_interruption';
    case ROADWORK = 'roadwork';
    case GENERAL = 'general';

    public function label(): string
    {
        return match ($this) {
            self::EMERGENCY => 'Emergency',
            self::ADVISORY => 'Advisory',
            self::UTILITY_INTERRUPTION => 'Utility Interruption',
            self::ROADWORK => 'Roadwork',
            self::GENERAL => 'General',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
