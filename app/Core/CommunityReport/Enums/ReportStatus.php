<?php

namespace App\Core\CommunityReport\Enums;

enum ReportStatus: string
{
    case PENDING = 'pending';
    case IN_PROGRESS = 'in_progress';
    case RESOLVED = 'resolved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending Review',
            self::IN_PROGRESS => 'In Progress',
            self::RESOLVED => 'Resolved',
            self::REJECTED => 'Rejected',
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
