<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CatalogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [...$this->resource->only(['id', 'code', 'name', 'description', 'category', 'base_unit', 'is_active', 'base_unit_locked', 'source_type', 'contact_name', 'contact_phone', 'contact_email', 'address', 'notes', 'items_in_stock', 'draft_receipts_count']),
            ...($this->resource instanceof \App\Core\GoodsDistribution\Models\Program ? $this->resource->only(['cooldown_enabled', 'cooldown_scope', 'cooldown_duration', 'cooldown_unit']) : []),
            'connected_programs' => $this->whenLoaded('programItems', fn () => $this->programItems->map(fn ($membership) => [
                'id' => $membership->program_id, 'name' => $membership->program->name, 'is_active' => $membership->is_active,
            ])->values()->all()),
        ];
    }
}
