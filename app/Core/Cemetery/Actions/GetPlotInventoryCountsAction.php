<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Models\Plot;

class GetPlotInventoryCountsAction
{
    /**
     * @return array{total:int, available:int, occupied:int, reserved:int, maintenance:int}
     */
    public function execute(string $municipalId, string $cemeterySiteId): array
    {
        $rows = Plot::query()
            ->where('municipal_id', $municipalId)
            ->where('cemetery_site_id', $cemeterySiteId)
            ->where('occupancy_mode', '!=', PlotOccupancyMode::SLOTTED->value)
            ->selectRaw('status, COUNT(*) AS total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $counts = [
            'available' => (int) ($rows['available'] ?? 0),
            'occupied' => (int) ($rows['occupied'] ?? 0),
            'reserved' => (int) ($rows['reserved'] ?? 0),
            'maintenance' => (int) ($rows['maintenance'] ?? 0),
        ];

        $counts['total'] = array_sum($counts);

        return $counts;
    }
}
