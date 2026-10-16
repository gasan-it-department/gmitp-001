<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\GoodsDistribution\Enums\MovementType;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class StockMovement extends GoodsModel
{
    protected $table = 'gd_stock_movements';

    public const UPDATED_AT = null;

    protected $fillable = [
        'municipal_id', 'stock_receipt_line_id', 'base_unit', 'type', 'operation_key', 'quantity',
        'occurred_on', 'posted_at', 'actor_user_id', 'reason', 'reference', 'reverses_movement_id',
        'distribution_stock_allocation_id', 'bulk_dispatch_stock_allocation_id', 'bulk_dispatch_reconciliation_line_id',
    ];

    protected $casts = ['quantity' => 'decimal:3', 'occurred_on' => 'date', 'posted_at' => 'datetime'];

    protected static function booted(): void
    {
        self::creating(function (self $movement): void {
            if ($movement->type === 'bulk_dispatch') {
                $allocation = BulkDispatchStockAllocation::query()->where('municipal_id', $movement->municipal_id)
                    ->whereKey($movement->bulk_dispatch_stock_allocation_id)->firstOrFail();
                if ($allocation->status !== 'reserved' || $allocation->stock_receipt_line_id !== $movement->stock_receipt_line_id
                    || $movement->quantity !== app(StockQuantityService::class)->format(-app(StockQuantityService::class)->parse($allocation->quantity, $allocation->base_unit))) {
                    throw new \DomainException('Bulk departure must consume its exact reserved batch quantity.');
                }
            } elseif ($movement->bulk_dispatch_stock_allocation_id !== null) {
                throw new \DomainException('Only bulk departures may reference a bulk allocation.');
            }
            if ($movement->type === 'bulk_return' || $movement->bulk_dispatch_reconciliation_line_id !== null) {
                $line = BulkDispatchReconciliationLine::query()->where('municipal_id', $movement->municipal_id)
                    ->whereKey($movement->bulk_dispatch_reconciliation_line_id)->with('reconciliation.reversedEntry')->firstOrFail();
                $kind = $line->reconciliation->kind;
                $valid = $movement->type === 'bulk_return' ? $kind === 'return'
                    : $movement->type === 'reversal' && $kind === 'reversal' && $line->reconciliation->reversedEntry?->kind === 'return';
                if (! $valid || $line->stock_receipt_line_id !== $movement->stock_receipt_line_id || $line->base_unit !== $movement->base_unit
                    || $line->quantity !== $movement->quantity) {
                    throw new \DomainException('Bulk return movements must match their reconciliation batch and quantity.');
                }
            }
            if ($movement->type === MovementType::Distribution->value) {
                if (! filled($movement->distribution_stock_allocation_id)) {
                    throw new \DomainException('Distribution movements must reference a stock allocation.');
                }
                $quantity = app(StockQuantityService::class)->parse(
                    (string) ($movement->getAttributes()['quantity'] ?? ''), $movement->base_unit, signed: true,
                );
                if ($quantity >= 0) {
                    throw new \DomainException('Distribution movements must deduct a positive quantity of goods.');
                }
            } elseif ($movement->distribution_stock_allocation_id !== null) {
                throw new \DomainException('Only distribution movements may reference a stock allocation.');
            }
        });
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

    public function bulkAllocation(): BelongsTo
    {
        return $this->belongsTo(BulkDispatchStockAllocation::class, 'bulk_dispatch_stock_allocation_id');
    }

    public function bulkReconciliationLine(): BelongsTo
    {
        return $this->belongsTo(BulkDispatchReconciliationLine::class, 'bulk_dispatch_reconciliation_line_id');
    }
}
