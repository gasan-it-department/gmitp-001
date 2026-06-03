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
        // New hierarchy: plot → block → section (sections no longer live
        // directly on the plot). `plot.parent` is loaded so the profile can
        // display the container name (e.g. "A-12") alongside the slot label.
        return Decedent::with([
            'currentInterment.plot.block.section',
            'currentInterment.plot.parent',
            'media',
        ])
            ->where('municipal_id', $municipalId)
            ->findOrFail($decedentId);
    }
}
