<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkAdditionalIssueStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Issued = 'issued';
    case Cancelled = 'cancelled';
}
