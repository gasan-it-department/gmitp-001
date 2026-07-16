<?php

namespace App\External\Api\Resources\Cemetery\Sites;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CemeterySectionLayoutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'blocks' => $this->whenLoaded('blocks', fn () => $this->blocks->map(fn ($block) => [
                'id' => $block->id,
                'name' => $block->name,
                'status' => $block->status,
                'counts' => [
                    'total' => (int) $block->total_plots_count,
                    'available' => (int) $block->available_plots_count,
                    'occupied' => (int) $block->occupied_plots_count,
                    'maintenance' => (int) $block->maintenance_plots_count,
                ],
                'apartments' => $block->relationLoaded('plots')
                    ? $block->plots->map(fn ($plot) => [
                        'id' => $plot->id,
                        'name' => $plot->name,
                        'slots_count' => (int) $plot->slots_count,
                    ])->values()
                    : [],
            ])->values()),
        ];
    }
}
