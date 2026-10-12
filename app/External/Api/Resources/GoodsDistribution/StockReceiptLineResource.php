<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Brick\Math\BigDecimal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class StockReceiptLineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $draft = $this->receipt_status === 'draft';
        $membership = $this->relationLoaded('item') && $this->item?->relationLoaded('programItems')
            ? $this->item->programItems->firstWhere('program_id', $this->program_id) : null;

        return [
            ...$this->resource->only(['id', 'line_number', 'item_id', 'program_id', 'base_unit', 'quantity', 'package_type', 'package_count', 'quantity_per_package', 'batch_reference', 'notes']),
            'item_name' => $draft && $this->relationLoaded('item') ? $this->item->name : $this->item_name_snapshot,
            'program_name' => $draft && $this->relationLoaded('program') ? $this->program?->name : $this->program_name_snapshot,
            'item_is_active' => $this->whenLoaded('item', fn () => (bool) $this->item?->is_active),
            'program_item_active' => $this->program_id ? (bool) $membership?->is_active : null,
            'receivable' => $this->when($draft && $this->relationLoaded('item') && $this->item?->relationLoaded('programItems'), fn () => (bool) $this->item?->is_active && (! $this->program_id || ($this->program?->is_active && $membership?->is_active))),
            'expires_on' => $this->expires_on?->toDateString(),
            'expiry_state' => ! $this->expires_on ? 'none' : ($this->expires_on->lt(today()) ? 'expired' : ($this->expires_on->lte(today()->addDays(30)) ? 'soon' : 'current')),
            'balance' => (string) BigDecimal::of((string) ($this->balance ?? '0'))->toScale(3),
            'reserved' => (string) BigDecimal::of((string) ($this->reserved ?? '0'))->toScale(3),
            'unreserved' => (string) BigDecimal::of((string) ($this->balance ?? '0'))->minus((string) ($this->reserved ?? '0'))->toScale(3),
            'available' => (string) BigDecimal::of((string) ($this->available ?? BigDecimal::of((string) ($this->balance ?? '0'))->minus((string) ($this->reserved ?? '0'))))->toScale(3),
            'receipt' => $this->whenLoaded('receipt', fn () => $this->receipt->only(['id', 'receipt_number', 'status', 'source_name_snapshot', 'storage_location_name_snapshot'])),
        ];
    }
}
