<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class StockMovement extends GoodsModel
{
    protected $table = 'gd_stock_movements';

    public const UPDATED_AT = null;

    protected $casts = ['quantity' => 'decimal:3', 'occurred_on' => 'date', 'posted_at' => 'datetime'];

    protected static function booted(): void
    {
        self::updating(fn () => throw new \DomainException('Stock movements cannot be edited. Record a reversal instead.'));
        self::deleting(fn () => throw new \DomainException('Stock movements cannot be deleted. Record a reversal instead.'));
    }

    public function line(): BelongsTo
    {
        return $this->belongsTo(StockReceiptLine::class, 'stock_receipt_line_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public function reversal(): HasOne
    {
        return $this->hasOne(self::class, 'reverses_movement_id');
    }

    public function distributionAllocation(): BelongsTo
    {
        return $this->belongsTo(DistributionStockAllocation::class, 'distribution_stock_allocation_id');
    }
}
