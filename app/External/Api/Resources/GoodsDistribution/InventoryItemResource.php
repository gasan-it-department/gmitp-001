<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Brick\Math\BigDecimal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $balance = BigDecimal::of((string) ($this->balance ?? '0'))->toScale(3);
        $reserved = BigDecimal::of((string) ($this->reserved ?? '0'))->toScale(3);

        return [...$this->resource->only(['id', 'code', 'name', 'category', 'base_unit', 'is_active']), 'balance' => (string) $balance,
            'reserved' => (string) $reserved, 'available' => (string) BigDecimal::of((string) ($this->available ?? $balance->minus($reserved)))->toScale(3)];
    }
}
