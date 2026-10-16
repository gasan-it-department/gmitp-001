<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\GoodsDistribution\Enums\AllocationStatus;
use App\Core\GoodsDistribution\Services\StockQuantityService;

final class DistributionStockAllocation extends GoodsModel
{
    protected $table = 'gd_distribution_stock_allocations';

    protected $casts = ['quantity' => 'decimal:3', 'approval_revision' => 'integer'];

    protected $attributes = ['status' => AllocationStatus::Reserved->value];

    protected static function booted(): void
    {
        self::saving(function (self $allocation): void {
            $attributes = $allocation->getAttributes();
            $status = $attributes['status'] ?? null;
            if (! is_string($status) || AllocationStatus::tryFrom($status) === null) {
                throw new \DomainException('Select a valid allocation status: reserved, consumed, or cancelled.');
            }
            $quantity = app(StockQuantityService::class)->parse(
                (string) ($attributes['quantity'] ?? ''), (string) ($attributes['base_unit'] ?? ''),
            );
            if ($quantity < 1) {
                throw new \DomainException('Stock allocation quantities must be positive.');
            }
        });
    }
}
