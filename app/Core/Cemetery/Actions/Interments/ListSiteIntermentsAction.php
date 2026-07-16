<?php

namespace App\Core\Cemetery\Actions\Interments;

use App\Core\Cemetery\Models\Interment;
use Illuminate\Database\Eloquent\Collection;

class ListSiteIntermentsAction
{
    /**
     * @return Collection<int, Interment>
     */
    public function execute(string $municipalId, string $cemeterySiteId): Collection
    {
        return Interment::query()
            ->with([
                'decedent.unidentifiedDetail',
                'plot.parent',
                'plot.block.section',
            ])
            ->where('municipal_id', $municipalId)
            ->active()
            ->whereHas('plot', fn ($query) => $query
                ->where('municipal_id', $municipalId)
                ->where('cemetery_site_id', $cemeterySiteId))
            ->latest('interment_date')
            ->latest()
            ->get();
    }
}
