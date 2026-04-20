<?php

namespace App\External\Api\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementTransparencyDetailResource extends JsonResource
{

    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number ?? 'Pending PhilGEPS',
            'title' => $this->title,
            'category' => $this->category,
            'status' => $this->status,
            'department_name' => $this->department->name,

            'abc_amount' => (float) $this->abc_amount,

            'published_at' => $this->published_at?->format('M d, Y'),
            'pre_bid_date' => $this->pre_bid_date?->format('M d, Y g:i A'),
            'closing_date' => $this->closing_date?->format('M d, Y g:i A'),

            'winning_bidder' => $this->when($this->status->value === 'awarded', $this->winning_bidder_name),
            'contract_amount' => $this->when($this->status->value === 'awarded', (float) $this->contract_amount),

            'failure_reason' => $this->when($this->status->value === 'failed', $this->failure_reason),

            'documents' => ProcurementFileResource::collection($this->whenLoaded('media')),
        ];
    }

}