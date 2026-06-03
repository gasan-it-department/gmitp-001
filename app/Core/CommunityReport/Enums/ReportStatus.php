<?php

namespace App\Core\CommunityReport\Enums;

enum ReportStatus: string
{
    case PENDING = 'pending';
    case IN_PROGRESS = 'in_progress';
    case ACKNOWLEDGED = 'acknowledged';
    case RESOLVED = 'resolved';
    case REJECTED = 'rejected';

    public function description(): string
    {
        return match ($this) {
            self::PENDING => 'The report has been submitted and is awaiting initial review by an administrator.',
            self::ACKNOWLEDGED => 'An administrator has reviewed the report and confirmed it is valid, but work has not yet started.',
            self::IN_PROGRESS => 'Personnel or crews have been dispatched and are actively working on resolving the issue.',
            self::RESOLVED => 'The issue has been successfully addressed and the report is now closed.',
            self::REJECTED => 'The report was closed because it was deemed invalid, a duplicate, or outside of municipal jurisdiction.',
        };
    }


    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending Review',
            self::IN_PROGRESS => 'In Progress',
            self::ACKNOWLEDGED => 'Acknowledged',
            self::RESOLVED => 'Resolved',
            self::REJECTED => 'Rejected',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn(self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'description' => $case->description(),
        ], self::cases());
    }

}
