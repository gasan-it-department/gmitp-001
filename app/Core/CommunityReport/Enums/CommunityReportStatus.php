<?php

namespace App\Core\CommunityReport\Enums;

enum CommunityReportStatus: string
{

    case PENDING = 'pending';
    case RESOLVED = 'resolve';
    case IN_PROGRESS = 'in_progress';
    case REJECTED = 'rejected';
    case ARCHIVED = 'archived';

    public function label(): string
    {

        return match ($this) {

            self::PENDING => 'Pending Review',

            self::RESOLVED => 'Resolved',

            self::REJECTED => 'Declined',

            self::IN_PROGRESS => 'In Progress',

        };

    }

    public function color(): string
    {

        return match ($this) {

            self::PENDING => 'orange',

            self::RESOLVED => 'green',

            self::REJECTED => 'red',

            self::IN_PROGRESS => 'blue',

        };

    }

}