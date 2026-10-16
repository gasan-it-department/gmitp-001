<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkDispatchStatus: string
{
    case Draft = 'draft';
    case Approved = 'approved';
    case Dispatched = 'dispatched';
    case Closed = 'closed';
    case Cancelled = 'cancelled';
}
