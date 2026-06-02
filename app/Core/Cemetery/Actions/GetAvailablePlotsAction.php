<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Collection;

/**
 * Returns plots in the AVAILABLE status to populate the assign-decedent picker
 * on the interment screen (REQ-3.1). Direct Eloquent — no repository.
 */
class GetAvailablePlotsAction
{
    public function execute(string $municipalId): Collection
    {
        return Plot::with('section')
            ->where('municipal_id', $municipalId)
            ->where('status', PlotStatus::AVAILABLE->value)
            ->orderBy('plot_number')
            ->get();
    }
}
