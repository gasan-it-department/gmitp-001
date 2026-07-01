<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Models\Plot;

class GetPlotProfileAction
{
    public function execute(string $municipalId, string $cemeterySiteId, string $plotId): Plot
    {
        return Plot::query()
            ->with([
                'block.section',
                'parent',
                'activeLease.activities' => fn ($query) => $query
                    ->with('causer')
                    ->latest()
                    ->limit(50),
                'slots' => fn ($query) => $query
                    ->withCount('interments')
                    ->orderBy('level')
                    ->orderBy('row')
                    ->orderBy('position'),
                'interments' => fn ($query) => $query
                    ->with(['decedent.unidentifiedDetail'])
                    ->latest('interment_date')
                    ->latest(),
                'activities' => fn ($query) => $query
                    ->with('causer')
                    ->latest()
                    ->limit(50),
            ])
            ->withCount('interments')
            ->where('municipal_id', $municipalId)
            ->where('cemetery_site_id', $cemeterySiteId)
            ->findOrFail($plotId);
    }
}
