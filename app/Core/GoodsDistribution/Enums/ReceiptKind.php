<?php

namespace App\Core\GoodsDistribution\Enums;

enum ReceiptKind: string
{
    case Receipt = 'receipt';
    case Opening = 'opening';
}
