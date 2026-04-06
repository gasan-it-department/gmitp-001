<?php

namespace App\External\Api\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementListResource extends JsonResource
{
    public function toArray(Request $request): array
    {

        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'title' => $this->title,
            'category' => $this->category,
            'status' => $this->status,
            'abc_amount' => (float) $this->abc_amount,
            'closing_date' => $this->closing_date?->format('M d, Y'),
        ];
    }
}