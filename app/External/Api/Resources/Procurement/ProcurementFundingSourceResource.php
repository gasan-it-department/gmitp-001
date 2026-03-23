<?php

namespace App\External\Api\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementFundingSourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // This is the ULID
            'name' => $this->name,
            'code' => $this->code,
            // Combine them for a clean dropdown label if you want:
            'label' => "{$this->name} ({$this->code})",
        ];
    }
}