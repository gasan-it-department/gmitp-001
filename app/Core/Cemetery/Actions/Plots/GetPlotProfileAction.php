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
                    ->withCount(['interments' => fn ($intermentQuery) => $intermentQuery->active()])
                    ->orderBy('level')
                    ->orderBy('row')
                    ->orderBy('position'),
                'interments' => fn ($query) => $query
                    ->with(['decedent.unidentifiedDetail'])
                    ->active()
                    ->latest('interment_date')
                    ->latest(),
                'intermentHistory' => fn ($query) => $query
                    ->with([
                        'decedent.unidentifiedDetail',
                        'nextInterments.plot.block.section',
                    ])
                    ->where(function ($query): void {
                        $query
                            ->whereNotNull('ended_at')
                            ->orWhereNotNull('voided_at');
                    })
                    ->latest('interment_date')
                    ->latest(),
                'activities' => fn ($query) => $query
                    ->with('causer')
                    ->latest()
                    ->limit(50),
            ])
            ->withCount([
                'interments' => fn ($query) => $query->active(),
                'interments as interments_with_trashed_count' => fn ($query) => $query->withTrashed(),
                'leases as leases_with_trashed_count' => fn ($query) => $query->withTrashed(),
                'slots as child_history_count' => fn ($query) => $query
                    ->withTrashed()
                    ->where(function ($query): void {
                        $query
                            ->whereHas('interments', fn ($intermentQuery) => $intermentQuery->withTrashed())
                            ->orWhereHas('leases', fn ($leaseQuery) => $leaseQuery->withTrashed());
                    }),
            ])
            ->where('municipal_id', $municipalId)
            ->where('cemetery_site_id', $cemeterySiteId)
            ->findOrFail($plotId);
    }
}
