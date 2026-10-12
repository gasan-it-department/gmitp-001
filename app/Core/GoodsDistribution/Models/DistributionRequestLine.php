<?php

namespace App\Core\GoodsDistribution\Models;

final class DistributionRequestLine extends GoodsModel
{
    protected $table = 'gd_distribution_request_lines';

    protected $casts = ['quantity' => 'decimal:3', 'is_active' => 'boolean'];
}
