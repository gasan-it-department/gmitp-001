<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\DeletePlotDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeletePlotAction
{
    public function execute(DeletePlotDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->cemeterySiteId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $children = $plot->slots()->withTrashed()->get();
            $this->assertDeletable($plot, $children);

            $deletedChildIds = [];
            $event = $this->eventName($plot);
            $description = $this->description($plot);

            if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
                $deletedChildIds = $children->pluck('id')->values()->all();
            }

            activity('cemetery_plot')
                ->performedOn($plot)
                ->causedBy(auth()->user())
                ->event($event)
                ->withProperties([
                    'reason' => $dto->reason,
                    'plot_id' => $plot->id,
                    'plot_name' => $plot->name,
                    'block_id' => $plot->block_id,
                    'cemetery_site_id' => $plot->cemetery_site_id,
                    'parent_plot_id' => $plot->parent_plot_id,
                    'deleted_child_ids' => $deletedChildIds,
                ])
                ->log($description);

            if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
                $children->each->forceDeleteQuietly();
            }

            $plot->forceDeleteQuietly();
            $this->syncParentCapacity($plot);

            return $plot;
        });
    }

    /**
     * @param  Collection<int, Plot>  $children
     */
    private function assertDeletable(Plot $plot, Collection $children): void
    {
        if ($plot->parent_plot_id !== null) {
            if ($this->hasHistory($plot)) {
                throw ValidationException::withMessages([
                    'plot' => 'This niche slot cannot be deleted because it already has interment or lease history.',
                ]);
            }

            return;
        }

        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            if ($this->hasHistory($plot)) {
                throw ValidationException::withMessages([
                    'plot' => 'This apartment cannot be deleted because it already has interment or lease history.',
                ]);
            }

            $this->assertApartmentHasNoHistory($children);

            return;
        }

        if ($children->isNotEmpty()) {
            throw ValidationException::withMessages([
                'plot' => 'Plots with child slots cannot be deleted through the standard plot deletion flow.',
            ]);
        }

        if ($this->hasHistory($plot)) {
            throw ValidationException::withMessages([
                'plot' => 'This plot cannot be deleted because it already has interment or lease history.',
            ]);
        }
    }

    /**
     * @param  Collection<int, Plot>  $children
     */
    private function assertApartmentHasNoHistory(Collection $children): void
    {
        foreach ($children as $child) {
            if ($this->hasHistory($child)) {
                throw ValidationException::withMessages([
                    'plot' => 'This apartment cannot be deleted because one or more child niches already has interment or lease history.',
                ]);
            }
        }
    }

    private function hasHistory(Plot $plot): bool
    {
        return $plot->interments()->withTrashed()->exists()
            || $plot->leases()->withTrashed()->exists();
    }

    private function syncParentCapacity(Plot $plot): void
    {
        if ($plot->parent_plot_id === null) {
            return;
        }

        Plot::query()
            ->whereKey($plot->parent_plot_id)
            ->update([
                'capacity' => Plot::query()
                    ->where('parent_plot_id', $plot->parent_plot_id)
                    ->count(),
            ]);
    }

    private function eventName(Plot $plot): string
    {
        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            return 'apartment_deleted';
        }

        if ($plot->parent_plot_id !== null) {
            return 'niche_slot_deleted';
        }

        return 'plot_deleted';
    }

    private function description(Plot $plot): string
    {
        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            return 'Apartment deleted';
        }

        if ($plot->parent_plot_id !== null) {
            return 'Niche slot deleted';
        }

        return 'Plot deleted';
    }
}
