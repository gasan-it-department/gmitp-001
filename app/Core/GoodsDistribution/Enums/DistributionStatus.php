<?php

namespace App\Core\GoodsDistribution\Enums;

enum DistributionStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case UnderReview = 'under_review';
    case Returned = 'returned';
    case Approved = 'approved';
    case Released = 'released';
    case Cancelled = 'cancelled';

    public function terminal(): bool
    {
        return in_array($this, [self::Released, self::Cancelled], true);
    }
}
