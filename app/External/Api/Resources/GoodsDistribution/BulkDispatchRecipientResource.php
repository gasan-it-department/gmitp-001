<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BulkDispatchRecipientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [...$this->resource->only(['id', 'bulk_dispatch_id', 'version', 'first_name', 'middle_name', 'last_name', 'suffix', 'full_name', 'barangay', 'purok', 'collector_name', 'collector_relationship',
            'paper_reference', 'paper_row', 'remarks', 'void_reason']), 'status' => $this->status->value,
            'acknowledgement' => $this->acknowledgement?->value, 'received_on' => $this->received_on?->toDateString(),
            'created_at' => $this->created_at->toIso8601String(), 'voided_at' => $this->voided_at?->toIso8601String(),
            'lines' => $this->whenLoaded('lines', fn () => $this->lines->map(fn ($line) => $line->only(['id', 'bulk_dispatch_line_id', 'item_id',
                'item_name_snapshot', 'item_code_snapshot', 'base_unit', 'quantity']))->values()->all())];
    }
}
