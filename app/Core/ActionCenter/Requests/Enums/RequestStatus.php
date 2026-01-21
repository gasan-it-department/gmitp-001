<?php

namespace App\Core\ActionCenter\Requests\Enums;

enum RequestStatus: string
{
    case PENDING = 'pending';
    case IN_REVIEW = 'in_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case EXPIRED = 'expired';
    case ARCHIVED = 'archived';
    case HOLD = 'hold';
    case UNDER_EVALUATION = 'under_review';

    public function label(): string
    {
        return match ($this) {

            self::PENDING => 'Pending',

            self::IN_REVIEW => 'In Review',

            self::APPROVED => 'Approved',

            self::REJECTED => 'Rejected',

            self::COMPLETED => 'Completed',

            self::CANCELLED => 'Cancelled',

            self::EXPIRED => 'Expired',

            self::ARCHIVED => 'Archived',

            self::HOLD => 'Hold',

            self::UNDER_EVALUATION => 'Under Evaluation'

        };
    }
}
