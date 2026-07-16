<?php

namespace App\External\Api\Resources\Cemetery;

use App\Core\Cemetery\Enums\PlotOccupancyMode;
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
        /** @var PlotOccupancyMode|null $occupancyMode */
        $occupancyMode = $this->occupancy_mode;
        $intermentsCount = (int) ($this->interments_count ?? 0);
        $occupiedSlotsCount = (int) ($this->occupied_slots_count ?? 0);
        $occupancyCount = $occupancyMode === PlotOccupancyMode::SLOTTED ? $occupiedSlotsCount : $intermentsCount;
        $availableCapacity = max(0, (int) $this->capacity - $intermentsCount);

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
            'area_sqm' => $this->area_sqm,
            'occupancy_mode' => $occupancyMode?->value,
            'occupancy_mode_label' => $occupancyMode?->label(),
            'active_interments_count' => $intermentsCount,
            'available_capacity' => $availableCapacity,
            'occupancy_label' => $occupancyCount.' / '.$this->capacity,
            'type' => $type?->value,
            'type_label' => $type?->label(),
            'status' => $status?->value,
            'status_label' => $status?->label(),
            'status_tone' => $status?->tone(),
            'active_lease' => $this->whenLoaded('activeLease', fn () => $this->activeLease ? [
                'id' => $this->activeLease->id,
                'leaseholder_name' => $this->activeLease->leaseholder_name,
                'leaseholder_contact' => $this->activeLease->leaseholder_contact,
                'leaseholder_relationship' => $this->activeLease->leaseholder_relationship,
                'lease_start' => $this->activeLease->lease_start?->format('Y-m-d'),
                'lease_end' => $this->activeLease->lease_end?->format('Y-m-d'),
                'or_number' => $this->activeLease->or_number,
            ] : null),

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
