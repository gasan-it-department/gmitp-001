<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class StockReceipt extends GoodsModel
{
    protected $table = 'gd_stock_receipts';

    protected $casts = ['received_on' => 'date', 'posted_at' => 'datetime', 'voided_at' => 'datetime'];

    public function lines(): HasMany
    {
        return $this->hasMany(StockReceiptLine::class, 'stock_receipt_id')->orderBy('line_number');
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(StockSource::class, 'stock_source_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class, 'storage_location_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by_user_id');
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by_user_id');
    }
}
