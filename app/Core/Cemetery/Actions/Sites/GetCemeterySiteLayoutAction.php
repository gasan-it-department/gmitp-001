<?php

namespace App\Core\Cemetery\Actions\Sites;

use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Models\Section;
use Illuminate\Support\Collection;

class GetCemeterySiteLayoutAction
{
    public function execute(string $municipalId, string $cemeterySiteId): Collection
    {
        return Section::query()
            ->where('municipal_id', $municipalId)
            ->where('cemetery_site_id', $cemeterySiteId)
            ->orderBy('name')
            ->with(['blocks' => fn ($query) => $query
                ->where('municipal_id', $municipalId)
                ->orderBy('name')
                ->withCount([
                    'plots as total_plots_count' => fn ($query) => $this->leafPlots($query),
                    'plots as available_plots_count' => fn ($query) => $this->leafPlots($query)->where('status', 'available'),
                    'plots as occupied_plots_count' => fn ($query) => $this->leafPlots($query)->where('status', 'occupied'),
                    'plots as maintenance_plots_count' => fn ($query) => $this->leafPlots($query)->where('status', 'maintenance'),
                ])])
            ->get();
    }

    private function leafPlots($query)
    {
        return $query->where('occupancy_mode', '!=', PlotOccupancyMode::SLOTTED->value);
    }
}
