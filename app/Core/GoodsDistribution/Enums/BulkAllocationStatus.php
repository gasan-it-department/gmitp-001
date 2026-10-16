<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkAllocationStatus: string
{
    case Reserved = 'reserved';
    case Issued = 'issued';
    case Cancelled = 'cancelled';
}
