<?php

namespace App\Core\GoodsDistribution\Enums;

enum ReceiptStatus: string
{
    case Draft = 'draft';
    case Posted = 'posted';
    case Voided = 'voided';
}
