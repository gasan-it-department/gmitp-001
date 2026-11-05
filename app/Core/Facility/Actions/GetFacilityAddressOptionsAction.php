<?php

namespace App\Core\Facility\Actions;

use App\Core\Municipality\Models\Municipality;
use Illuminate\Support\Facades\DB;

class GetFacilityAddressOptionsAction
{
    public function execute(string $municipalId): array
    {
        $psgcMunicipalityId = Municipality::query()->whereKey($municipalId)->value('psgc_municipal_id');

        if (! $psgcMunicipalityId) {
            return [];
        }

        return DB::table('psgc_barangays')
            ->where('municipality_id', $psgcMunicipalityId)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($barangay) => ['id' => (string) $barangay->id, 'name' => $barangay->name])
            ->all();
    }
}
