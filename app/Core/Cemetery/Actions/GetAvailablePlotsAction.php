<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Collection;

class GetAvailablePlotsAction
{
    public function execute(string $municipalId, ?string $cemeterySiteId = null): Collection
    {
        return Plot::with(['block.section', 'parent', 'activeLease'])
            ->withCount('interments')
            ->where('municipal_id', $municipalId)
            ->when($cemeterySiteId, fn ($query) => $query->where('cemetery_site_id', $cemeterySiteId))
            ->whereNull('deleted_at')
            ->where(function ($query) {
                $query->where(function ($single) {
                    $single
                        ->where('occupancy_mode', PlotOccupancyMode::SINGLE->value)
                        ->where('status', PlotStatus::AVAILABLE->value)
                        ->whereDoesntHave('interments');
                })->orWhere(function ($shared) {
                    $shared
                        ->where('occupancy_mode', PlotOccupancyMode::SHARED->value)
                        ->whereIn('status', [PlotStatus::AVAILABLE->value, PlotStatus::OCCUPIED->value])
                        ->whereRaw('(
                            select count(*)
                            from cemetery_interments
                            where cemetery_interments.plot_id = cemetery_plots.id
                            and cemetery_interments.deleted_at is null
                        ) < cemetery_plots.capacity');
                });
            })
            ->orderBy('name')
            ->orderBy('level')
            ->get();
    }
}
