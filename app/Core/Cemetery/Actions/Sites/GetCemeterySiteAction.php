<?php

namespace App\Core\Cemetery\Actions\Sites;

use App\Core\Cemetery\Enums\CemeterySiteStatus;
use App\Core\Cemetery\Models\CemeterySite;

class GetCemeterySiteAction
{
    public function execute(
        string $municipalId,
        string $cemeterySiteId,
        bool $activeOnly = false,
    ): CemeterySite {
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
            ->when(
                $activeOnly,
                fn ($query) => $query->where(
                    'cemetery_sites.status',
                    CemeterySiteStatus::ACTIVE->value
                )
            )
            ->findOrFail($cemeterySiteId);
    }
}
