<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Models\Plot;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Paginated, tenant-scoped plot list for the admin index. Returns ONLY the
 * top-level rows (containers + single-capacity); child slots are reached by
 * drilling into the parent-detail page (MD §7 Workflow B).
 *
 * Direct Eloquent — no repository. Section is reached via block (new hierarchy).
 */
class ListPlotsAction
{
    public function execute(string $municipalId, ?string $statusFilter = null, int $perPage = 15): LengthAwarePaginator
    {
        return Plot::with(['block.section'])
            ->where('municipal_id', $municipalId)
            // Hide auto-generated child slots from the registry view.
            ->whereNull('parent_plot_id')
            ->when($statusFilter, fn ($query) => $query->where('status', $statusFilter))
            ->orderBy('name')
            ->paginate($perPage);
    }
}
