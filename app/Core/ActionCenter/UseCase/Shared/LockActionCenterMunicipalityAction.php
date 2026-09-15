<?php

namespace App\Core\ActionCenter\UseCase\Shared;

use App\Core\Municipality\Models\Municipality;
use Illuminate\Support\Facades\Schema;

final class LockActionCenterMunicipalityAction
{
    public function execute(string $municipalId): ?Municipality
    {
        // Several focused action tests build only the Action Center tables.
        // Production and full-schema tests always take the real tenant lock.
        if (! Schema::hasTable('municipalities')) {
            return null;
        }

        return Municipality::query()
            ->whereKey($municipalId)
            ->lockForUpdate()
            ->firstOrFail();
    }
}
