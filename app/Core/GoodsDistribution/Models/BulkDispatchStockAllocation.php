<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class BulkDispatchStockAllocation extends GoodsModel
{
    protected $table = 'gd_bulk_dispatch_stock_allocations';

    protected $casts = ['quantity' => 'decimal:3'];

    public function dispatch(): BelongsTo
    {
        return $this->belongsTo(BulkDispatch::class, 'bulk_dispatch_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(StockReceiptLine::class, 'stock_receipt_line_id');
    }

    public function line(): BelongsTo
    {
        return $this->belongsTo(BulkDispatchLine::class, 'bulk_dispatch_line_id');
    }

    public function departure(): HasOne
    {
        return $this->hasOne(StockMovement::class, 'bulk_dispatch_stock_allocation_id')->where('type', 'bulk_dispatch');
    }
}
