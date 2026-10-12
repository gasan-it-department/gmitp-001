<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            ...$this->resource->only(['id', 'stock_receipt_line_id', 'type', 'base_unit', 'quantity', 'reason', 'reference', 'reverses_movement_id']),
            'occurred_on' => $this->occurred_on->toDateString(), 'posted_at' => $this->posted_at->toIso8601String(),
            'actor' => $this->actor ? trim($this->actor->first_name.' '.$this->actor->last_name) : null,
            'reversal_id' => $this->reversal?->id,
            'item_id' => $this->line->item_id, 'item_name' => $this->line->item_name_snapshot,
            'program_id' => $this->line->program_id, 'program_name' => $this->line->program_name_snapshot,
            'batch_reference' => $this->line->batch_reference,
            'distribution_request_id' => $this->whenLoaded('distributionAllocation', fn () => $this->distributionAllocation?->distribution_request_id),
            'receipt' => $this->line->receipt->only(['id', 'receipt_number', 'status']),
        ];
    }
}
