<?php

namespace App\External\Api\Resources\Cemetery\Plots;

use App\Core\Cemetery\Enums\PlotOccupancyMode;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlotProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $intermentsCount = (int) ($this->interments_count ?? $this->interments->count());
        $capacity = (int) $this->capacity;

        return [
            'id' => $this->id,
            'cemetery_site_id' => $this->cemetery_site_id,
            'name' => $this->name,
            'slot_label' => $this->slotLabel,
            'parent_plot_id' => $this->parent_plot_id,
            'type' => $this->type?->value,
            'type_label' => $this->type?->label(),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'status_tone' => $this->status?->tone(),
            'occupancy_mode' => $this->occupancy_mode?->value,
            'occupancy_mode_label' => $this->occupancy_mode?->label(),
            'capacity' => $capacity,
            'active_interments_count' => $intermentsCount,
            'available_capacity' => max(0, $capacity - $intermentsCount),
            'occupancy_label' => $intermentsCount.' / '.$capacity,
            'can_accept_more' => $this->occupancy_mode === PlotOccupancyMode::SHARED && $intermentsCount < $capacity,
            'row' => $this->row,
            'level' => $this->level,
            'position' => $this->position,
            'block' => $this->block ? [
                'id' => $this->block->id,
                'name' => $this->block->name,
                'section' => $this->block->section ? [
                    'id' => $this->block->section->id,
                    'name' => $this->block->section->name,
                ] : null,
            ] : null,
            'parent' => $this->parent ? [
                'id' => $this->parent->id,
                'slot_label' => $this->parent->slotLabel,
            ] : null,
            'current_interments' => $this->interments->map(fn ($interment) => [
                'id' => $interment->id,
                'decedent_id' => $interment->decedent_id,
                'decedent_name' => $this->decedentName($interment->decedent),
                'decedent_profile_url' => route('cemetery.admin.decedents.profile.page', [
                    app('current_municipality')->slug,
                    $interment->decedent_id,
                ]),
                'interment_date' => $interment->interment_date?->format('Y-m-d'),
                'type' => $interment->type,
                'type_label' => ucfirst((string) $interment->type),
                'notes' => $interment->notes,
                'lease' => $interment->lease ? [
                    'id' => $interment->lease->id,
                    'leaseholder_name' => $interment->lease->leaseholder_name,
                    'leaseholder_contact' => $interment->lease->leaseholder_contact,
                    'leaseholder_relationship' => $interment->lease->leaseholder_relationship,
                    'lease_start' => $interment->lease->lease_start?->format('Y-m-d'),
                    'lease_end' => $interment->lease->lease_end?->format('Y-m-d'),
                    'or_number' => $interment->lease->or_number,
                ] : null,
            ])->values(),
            'child_niches' => $this->slots->map(fn ($slot) => [
                'id' => $slot->id,
                'slot_label' => $slot->slotLabel,
                'status' => $slot->status?->value,
                'status_label' => $slot->status?->label(),
                'status_tone' => $slot->status?->tone(),
                'capacity' => (int) $slot->capacity,
                'active_interments_count' => (int) ($slot->interments_count ?? 0),
                'occupancy_label' => ((int) ($slot->interments_count ?? 0)).' / '.$slot->capacity,
                'profile_url' => route('cemetery.admin.sites.plots.profile.page', [
                    app('current_municipality')->slug,
                    $slot->cemetery_site_id,
                    $slot->id,
                ]),
            ])->values(),
            'audit_timeline' => $this->activities->map(fn ($activity) => [
                'id' => $activity->id,
                'event' => $activity->event,
                'description' => $activity->description,
                'causer' => $activity->causer?->full_name ?? $activity->causer?->name,
                'changes' => $activity->changes,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at?->toIso8601String(),
            ])->values(),
        ];
    }

    private function decedentName($decedent): string
    {
        if (! $decedent) {
            return 'Unknown Decedent';
        }

        if ($decedent->identity_status?->value === 'unidentified') {
            return 'UNIDENTIFIED - '.($decedent->unidentifiedDetail?->case_reference ?? $decedent->id);
        }

        if (! $decedent->has_legal_name) {
            return $decedent->memorial_name ?? 'Unnamed Memorial Record';
        }

        return collect([$decedent->last_name, $decedent->first_name, $decedent->middle_name, $decedent->suffix])
            ->filter()
            ->join(', ');
    }
}
