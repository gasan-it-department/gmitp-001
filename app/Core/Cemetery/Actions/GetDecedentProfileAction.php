<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Models\Decedent;

/**
 * Fetches a single decedent for the profile / edit / assign screens (direct
 * Eloquent — no repository). Tenant-scoped: a cross-municipality id 404s here.
 * Eager-loads the current interment + plot snapshot and the identification media.
 */
class GetDecedentProfileAction
{
    public function execute(string $decedentId, string $municipalId): Decedent
    {
        return Decedent::with(['currentInterment.plot.section', 'media'])
            ->where('municipal_id', $municipalId)
            ->findOrFail($decedentId);
    }
}
