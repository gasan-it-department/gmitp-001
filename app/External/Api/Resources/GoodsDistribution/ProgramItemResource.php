<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ProgramItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'program_id' => $this->program_id, 'is_active' => $this->is_active,
            'item' => (new CatalogResource($this->item))->resolve($request),
        ];
    }
}
