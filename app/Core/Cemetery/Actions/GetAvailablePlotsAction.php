<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Collection;

/**
 * Returns AVAILABLE LEAVES (assignable slots) to populate the assign-decedent
 * picker on the interment screen (REQ-3.1 + FR-6).
 *
 * A leaf is either:
 *   • a child slot   (parent_plot_id IS NOT NULL), OR
 *   • a single-capacity plot (capacity = 1, no children, parent_plot_id NULL).
 *
 * Parent CONTAINERS (capacity > 1, no parent) are excluded — BR-4 forbids
 * interring directly into a container. The picker shows individual slots
 * (e.g. "A-12-L1", "A-12-L2", …) so there is no ambiguity for the admin.
 *
 * Block + section are eager-loaded so the picker can group/label slots by
 * their spatial home without an N+1.
 */
class GetAvailablePlotsAction
{
    public function execute(string $municipalId): Collection
    {
        return Plot::with(['block.section', 'parent'])
            ->where('municipal_id', $municipalId)
            ->where('status', PlotStatus::AVAILABLE->value)
            // Leaf-only filter — children OR single-capacity plots.
            ->where(function ($query) {
                $query->whereNotNull('parent_plot_id')
                    ->orWhere('capacity', 1);
            })
            ->orderBy('name')
            ->orderBy('level')
            ->get();
    }
}
