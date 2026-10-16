<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class DistributionRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'reference' => $this->reference, 'status' => $this->status->value, 'version' => $this->version,
            'program_id' => $this->program_id, 'program_name' => $this->program_name_snapshot,
            'storage_location_id' => $this->storage_location_id, 'storage_name' => $this->storage_name_snapshot,
            'beneficiary_id' => $this->beneficiary_id, 'assisted_household_member_id' => $this->assisted_household_member_id,
            'snapshot' => $this->reviewed_snapshot, 'filing_snapshot' => $this->filing_snapshot, 'handover_snapshot' => $this->handover_snapshot,
            'notes' => $this->notes, 'transition_reason' => $this->transition_reason, 'created_at' => $this->created_at->toIso8601String(),
            'cooldown_policy' => $this->cooldown_policy,
            'approved_at' => $this->approved_at?->toIso8601String(), 'released_at' => $this->released_at?->toIso8601String(),
            'approved_on' => $this->approved_at?->toDateString(),
            'actual_release_on' => $this->actual_release_on?->toDateString(), 'collector_type' => $this->collector_type,
            'collector_name' => $this->collector_name, 'collector_relationship' => $this->collector_relationship,
            'collector_id_type' => $this->collector_id_type, 'collector_id_last_four' => $this->collector_id_last_four,
            'acknowledgement_reference' => $this->acknowledgement_reference, 'release_notes' => $this->release_notes,
            'lines' => $this->whenLoaded('lines', fn () => $this->lines->values()->toArray()),
            'documents' => $this->whenLoaded('documentChecks', fn () => $this->documentChecks->values()->toArray()),
            'allocations' => $this->whenLoaded('allocations', fn () => $this->allocations->values()->toArray()),
        ];
    }
}
