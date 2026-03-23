<?php

namespace App\External\Api\Resources\PublicInformation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'reference_number' => $this->reference_number,

            'title' => $this->title,

            'category' => $this->category,

            'status' => $this->status,

            'approved_budget' => (float) $this->approved_budget,

            'contract_amount' => $this->contract_amount ? (float) $this->contract_amount : null,

            'winning_bidder' => $this->winning_bidder,

            'pre_bid_date' => $this->pre_bid_date?->toIso8601String(),

            'closing_date' => $this->closing_date?->toIso8601String(),

            'award_date' => $this->award_date?->toIso8601String(),

            'created_at' => $this->created_at?->toIso8601String(),

            'files' => ProcurementFileResource::collection($this->whenLoaded('files')),

        ];
    }
}
