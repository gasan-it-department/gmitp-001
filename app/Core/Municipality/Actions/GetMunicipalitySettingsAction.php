<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Models\Municipality;

class GetMunicipalitySettingsAction
{
    public function execute(string $municipalId): Municipality
    {
        return Municipality::query()
            ->with(['settings', 'media'])
            ->whereKey($municipalId)
            ->firstOrFail();
    }
}
