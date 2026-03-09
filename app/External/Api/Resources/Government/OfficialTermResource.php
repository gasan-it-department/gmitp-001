<?php

namespace App\External\Api\Resources\Government;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficialTermResource extends JsonResource
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
            'status' => $this->status,
            'actual_start_date' => $this->actual_start_date,
            'actual_end_date' => $this->actual_end_date,
            'remarks' => $this->remarks,
            // 2. The Official (Using the existing OfficialResource for consistency)
            // This ensures things like 'formatted_name' are included!
            'official' => new OfficialResource($this->whenLoaded('official')),

            // 3. The Position
            'position' => new PositionResource($this->whenLoaded('position')),

            'term' => new TermResource($this->whenLoaded('term')),
        ];

    }
}
