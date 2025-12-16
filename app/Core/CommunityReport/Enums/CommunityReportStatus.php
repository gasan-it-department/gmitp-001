<?php

namespace App\Core\CommunityReport\Enums;

enum CommunityReportStatus: string
{

    case PENDING = 'pending';
    case RESOLVED = 'resolve';
    case REJECTED = 'rejected';
    case ARCHIVED = 'archived';

    public function label(): string
    {

        return match ($this) {

            self::PENDING => 'Pending Review',

            self::RESOLVED => 'Resolved',

            self::REJECTED => 'Declined'

        };

    }

    public function color(): string
    {

        return match ($this) {

            self::PENDING => 'orange',

            self::RESOLVED => 'green',

            self::REJECTED => 'red',

        };

    }

}