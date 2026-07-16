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
        $isSlottedContainer = $this->occupancy_mode === PlotOccupancyMode::SLOTTED;
        $occupiedChildNichesCount = $isSlottedContainer
            ? $this->slots->filter(fn ($slot) => (int) ($slot->interments_count ?? 0) > 0)->count()
            : null;
        $timeline = $this->activities
            ->concat($this->activeLease?->activities ?? collect())
            ->sortByDesc('created_at')
            ->take(50);
        $municipality = app('current_municipality');

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
            'area_sqm' => $this->area_sqm,
            'active_interments_count' => $intermentsCount,
            'available_capacity' => max(0, $capacity - $intermentsCount),
            'occupancy_label' => ($occupiedChildNichesCount ?? $intermentsCount).' / '.$capacity,
            'can_accept_more' => $this->occupancy_mode === PlotOccupancyMode::SHARED && $intermentsCount < $capacity,
            'can_delete' => $this->deleteBlockedReason() === null,
            'delete_blocked_reason' => $this->deleteBlockedReason(),
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
            'active_lease' => $this->activeLease ? [
                'id' => $this->activeLease->id,
                'created_from_interment_id' => $this->activeLease->created_from_interment_id,
                'leaseholder_name' => $this->activeLease->leaseholder_name,
                'leaseholder_contact' => $this->activeLease->leaseholder_contact,
                'leaseholder_address' => $this->activeLease->leaseholder_address,
                'leaseholder_relationship' => $this->activeLease->leaseholder_relationship,
                'lease_start' => $this->activeLease->lease_start?->format('Y-m-d'),
                'lease_end' => $this->activeLease->lease_end?->format('Y-m-d'),
                'amount_paid' => $this->activeLease->amount_paid,
                'or_number' => $this->activeLease->or_number,
                'status' => $this->activeLease->status?->value,
                'notes' => $this->activeLease->notes,
            ] : null,
            'current_interments' => $this->interments->map(fn ($interment) => [
                'id' => $interment->id,
                'decedent_id' => $interment->decedent_id,
                'decedent_name' => $this->decedentName($interment->decedent),
                'decedent_profile_url' => route('cemetery.admin.decedents.profile.page', [
                    $municipality->slug,
                    $interment->decedent_id,
                ]),
                'interment_date' => $interment->interment_date?->format('Y-m-d'),
                'type' => $interment->type,
                'type_label' => ucfirst((string) $interment->type),
                'notes' => $interment->notes,
                'move_url' => route('cemetery.admin.interments.move.page', [
                    $municipality->slug,
                    $interment->id,
                ]),
                'can_reverse_move' => $interment->type === 'transfer' && $interment->previous_interment_id !== null,
                'reverse_move_url' => route('interments.reverse-move', [
                    'interment_id' => $interment->id,
                ]),
                'close_url' => route('interments.close', [
                    'interment_id' => $interment->id,
                ]),
                'void_url' => route('interments.void', [
                    'interment_id' => $interment->id,
                ]),
            ])->values(),
            'interment_history' => $this->intermentHistory->map(function ($interment) use ($municipality) {
                $nextInterment = $interment->nextInterments
                    ->sortByDesc(fn ($next) => $next->interment_date?->timestamp ?? 0)
                    ->first();
                $nextPlot = $nextInterment?->plot;

                return [
                    'id' => $interment->id,
                    'decedent_id' => $interment->decedent_id,
                    'decedent_name' => $this->decedentName($interment->decedent),
                    'decedent_profile_url' => route('cemetery.admin.decedents.profile.page', [
                        $municipality->slug,
                        $interment->decedent_id,
                    ]),
                    'interment_date' => $interment->interment_date?->format('Y-m-d'),
                    'type' => $interment->type,
                    'type_label' => ucfirst((string) $interment->type),
                    'status_label' => $this->historyStatusLabel($interment),
                    'ended_at' => $interment->ended_at?->toIso8601String(),
                    'end_type' => $interment->end_type,
                    'end_reason' => $interment->end_reason,
                    'end_notes' => $interment->end_notes,
                    'transfer_destination' => $interment->transfer_destination,
                    'permit_reference' => $interment->permit_reference,
                    'voided_at' => $interment->voided_at?->toIso8601String(),
                    'void_reason' => $interment->void_reason,
                    'destination_plot_label' => $nextPlot?->slotLabel,
                    'destination_plot_profile_url' => $nextPlot ? route('cemetery.admin.sites.plots.profile.page', [
                        $municipality->slug,
                        $nextPlot->cemetery_site_id,
                        $nextPlot->id,
                    ]) : null,
                ];
            })->values(),
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
            'audit_timeline' => $timeline->map(fn ($activity) => [
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

    private function historyStatusLabel($interment): string
    {
        if ($interment->voided_at !== null) {
            return 'Voided';
        }

        if ($interment->ended_at !== null) {
            return match ($interment->end_type) {
                'exhumed' => 'Exhumed',
                'transferred_out' => 'Transferred Out',
                default => 'Moved out',
            };
        }

        return 'Inactive';
    }

    private function deleteBlockedReason(): ?string
    {
        $hasDirectHistory = ((int) ($this->interments_with_trashed_count ?? 0)) > 0
            || ((int) ($this->leases_with_trashed_count ?? 0)) > 0;

        if ($this->parent_plot_id !== null) {
            return $hasDirectHistory
                ? 'This niche slot already has interment or lease history.'
                : null;
        }

        if ($this->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            if ($hasDirectHistory) {
                return 'This apartment already has interment or lease history.';
            }

            if (((int) ($this->child_history_count ?? 0)) > 0) {
                return 'This apartment has child niche history and cannot be deleted.';
            }

            return null;
        }

        if ($this->relationLoaded('slots') && $this->slots->isNotEmpty()) {
            return 'Plots with child slots cannot be deleted through the standard plot deletion flow.';
        }

        if ($hasDirectHistory) {
            return 'This plot already has interment or lease history.';
        }

        return null;
    }
}
