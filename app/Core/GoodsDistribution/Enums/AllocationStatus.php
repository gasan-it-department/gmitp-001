<?php

namespace App\Core\GoodsDistribution\Enums;

enum AllocationStatus: string
{
    case Reserved = 'reserved';
    case Consumed = 'consumed';
    case Cancelled = 'cancelled';
}
