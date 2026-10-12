<?php

namespace App\Core\GoodsDistribution\Enums;

enum MovementType: string
{
    case Receipt = 'receipt';
    case Opening = 'opening';
    case Adjustment = 'adjustment';
    case Reversal = 'reversal';
    case Distribution = 'distribution';
}
