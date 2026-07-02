<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Plot;

class RecalculatePlotStatusAction
{
    public function execute(Plot $plot): void
    {
        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            return;
        }

        $activeCount = $plot->interments()->active()->count();
        $plot->status = $activeCount > 0
            ? PlotStatus::OCCUPIED
            : PlotStatus::AVAILABLE;

        $plot->save();
    }
}
