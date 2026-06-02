<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Models\Plot;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Paginated, tenant-scoped plot list for the admin index (direct Eloquent — no
 * repository), with an optional status filter.
 */
class ListPlotsAction
{
    public function execute(string $municipalId, ?string $statusFilter = null, int $perPage = 15): LengthAwarePaginator
    {
        return Plot::with('section')
            ->where('municipal_id', $municipalId)
            ->when($statusFilter, fn ($query) => $query->where('status', $statusFilter))
            ->orderBy('plot_number')
            ->paginate($perPage);
    }
}
