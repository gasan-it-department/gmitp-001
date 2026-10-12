<?php

namespace App\Core\GoodsDistribution\Models;

final class DistributionStockAllocation extends GoodsModel
{
    protected $table = 'gd_distribution_stock_allocations';

    protected $casts = ['quantity' => 'decimal:3', 'approval_revision' => 'integer'];
}
