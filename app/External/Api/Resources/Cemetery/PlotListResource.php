<?php

namespace App\External\Api\Resources\Cemetery;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shape for plot list rows in both contexts: the admin plots registry (parents
 * + single-capacity) and the assign-decedent picker (leaves). The same
 * resource works for both because every row exposes its own status/capacity
 * and reaches block + section via the new hierarchy.
 */
class PlotListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var PlotStatus|null $status */
        $status = $this->status;
        /** @var PlotTypes|null $type */
        $type = $this->type;

        return [
            'id' => $this->id,
            'cemetery_site_id' => $this->cemetery_site_id,
            'name' => $this->name,
            'slot_label' => $this->slotLabel, // canonical UI identifier (SR-7)
            'parent_plot_id' => $this->parent_plot_id,
            'row' => $this->row,
            'level' => $this->level,
            'position' => $this->position,
            'capacity' => $this->capacity,
            'type' => $type?->value,
            'type_label' => $type?->label(),
            'status' => $status?->value,
            'status_label' => $status?->label(),
            'status_tone' => $status?->tone(),

            // Spatial home: block (always present) + section (via block).
            'block' => $this->whenLoaded('block', fn () => $this->block ? [
                'id' => $this->block->id,
                'name' => $this->block->name,
                'section' => $this->block->relationLoaded('section') && $this->block->section
                    ? ['id' => $this->block->section->id, 'name' => $this->block->section->name]
                    : null,
            ] : null),
        ];
    }
}
