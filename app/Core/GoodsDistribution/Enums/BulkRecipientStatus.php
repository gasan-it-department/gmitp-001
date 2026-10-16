<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkRecipientStatus: string
{
    case Active = 'active';
    case Voided = 'voided';
}
