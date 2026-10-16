<?php

namespace App\Core\GoodsDistribution\Enums;

enum CooldownUnit: string
{
    case Days = 'days';
    case Weeks = 'weeks';
    case Months = 'months';
}
