<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BulkDispatchLine extends GoodsModel
{
    protected $table = 'gd_bulk_dispatch_lines';

    protected $casts = ['quantity' => 'decimal:3', 'is_active' => 'boolean'];

    public function dispatch(): BelongsTo
    {
        return $this->belongsTo(BulkDispatch::class, 'bulk_dispatch_id');
    }
}
