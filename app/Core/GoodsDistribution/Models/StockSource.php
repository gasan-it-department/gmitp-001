<?php

namespace App\Core\GoodsDistribution\Models;

final class StockSource extends GoodsModel
{
    protected $table = 'gd_stock_sources';

    protected $casts = ['is_active' => 'boolean'];
}
