<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class RecentAssistanceRequestResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'status' => $this->status,
            'program_name' => $this->assistanceType?->name,
            'amount_approved' => $this->amount_approved !== null ? (float) $this->amount_approved : null,
            'submitted_at' => $this->created_at?->toIso8601String(),
        ];
    }
}