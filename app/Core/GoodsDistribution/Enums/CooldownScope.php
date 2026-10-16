<?php

namespace App\Core\GoodsDistribution\Enums;

enum CooldownScope: string
{
    case Recipient = 'recipient';
    case Household = 'household';
}
