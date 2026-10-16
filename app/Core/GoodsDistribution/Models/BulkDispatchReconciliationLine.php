<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BulkDispatchReconciliationLine extends GoodsModel
{
    protected $table = 'gd_bulk_dispatch_reconciliation_lines';

    public const UPDATED_AT = null;

    protected $casts = ['quantity' => 'decimal:3'];

    protected static function booted(): void
    {
        self::updating(fn () => throw new \DomainException('Reconciliation quantities cannot be overwritten.'));
        self::deleting(fn () => throw new \DomainException('Reconciliation quantities cannot be deleted.'));
    }

    public function reconciliation(): BelongsTo
    {
        return $this->belongsTo(BulkDispatchReconciliation::class, 'reconciliation_id');
    }

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(BulkDispatchStockAllocation::class, 'bulk_dispatch_stock_allocation_id');
    }
}
