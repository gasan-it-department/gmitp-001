<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkReconciliationKind: string
{
    case Distribution = 'distribution';
    case Return = 'return';
    case Reversal = 'reversal';
}
