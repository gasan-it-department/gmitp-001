<?php

namespace App\Core\GoodsDistribution\Enums;

enum BulkRecipientAcknowledgement: string
{
    case Signature = 'signature';
    case Thumbmark = 'thumbmark';
}
