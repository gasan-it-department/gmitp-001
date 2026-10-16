<?php

namespace App\External\Api\Resources\GoodsDistribution;

use App\Core\GoodsDistribution\Enums\BulkCustodianType;
use App\Core\GoodsDistribution\Enums\BulkDispatchPurpose;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BulkDispatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [...$this->resource->only(['id', 'reference', 'version', 'program_id', 'storage_location_id', 'requester_name', 'requester_role',
            'custodian_type', 'custodian_user_id', 'custodian_name', 'custodian_role', 'destination_barangays', 'purpose', 'purpose_notes', 'location_notes', 'paper_reference', 'transition_reason']),
            'custodian_type_label' => $this->approval_snapshot['custodian_type_label'] ?? BulkCustodianType::tryFrom($this->custodian_type)?->label(),
            'purpose_label' => $this->approval_snapshot['purpose_label'] ?? BulkDispatchPurpose::tryFrom($this->purpose ?? '')?->label(),
            'status' => $this->status->value, 'program_name' => $this->program_name_snapshot, 'storage_name' => $this->storage_name_snapshot,
            'created_at' => $this->created_at->toIso8601String(), 'approved_on' => $this->approved_at?->toDateString(),
            'actual_dispatch_on' => $this->actual_dispatch_on?->toDateString(), 'closed_at' => $this->closed_at?->toIso8601String(),
            'lines' => $this->whenLoaded('lines', fn () => $this->lines->map(fn ($line) => $line->only(['id', 'item_id', 'item_name_snapshot', 'item_code_snapshot', 'base_unit', 'quantity']))->values()->all())];
    }
}
