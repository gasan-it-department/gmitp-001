<?php

namespace App\Core\Cemetery\Actions\Sites;

use App\Core\Cemetery\Models\CemeterySite;
use Illuminate\Database\Eloquent\Collection;

class ListCemeterySitesAction
{
    /**
     * @return Collection<int, CemeterySite>
     */
    public function execute(string $municipalId): Collection
    {
        return CemeterySite::query()
            ->leftJoin(
                'psgc_barangays',
                'cemetery_sites.psgc_barangay_code',
                '=',
                'psgc_barangays.psgc_code'
            )
            ->select([
                'cemetery_sites.*',
                'psgc_barangays.name as barangay_name',
            ])
            ->withCount('sections')
            ->forMunicipality($municipalId)
            ->orderBy('cemetery_sites.name')
            ->get();
    }
}
