<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\GoodsDistribution\Enums\AllocationStatus;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class StockReceiptLine extends GoodsModel
{
    protected $table = 'gd_stock_receipt_lines';

    protected $casts = ['quantity' => 'decimal:3', 'quantity_per_package' => 'decimal:3', 'expires_on' => 'date'];

    protected static function booted(): void
    {
        self::saving(function (self $line): void {
            app(StockQuantityService::class)->assertReceiptLine($line->getAttributes(), (string) $line->base_unit);
        });
    }

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(StockReceipt::class, 'stock_receipt_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'stock_receipt_line_id');
    }

    public function reservedAllocations(): HasMany
    {
        return $this->hasMany(DistributionStockAllocation::class, 'stock_receipt_line_id')->where('status', AllocationStatus::Reserved->value);
    }
}
