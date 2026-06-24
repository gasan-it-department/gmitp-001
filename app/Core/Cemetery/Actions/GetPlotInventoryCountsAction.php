<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Models\Plot;

/**
 * Returns LEAF-level inventory counts for the admin plots overview (REQ-2.2).
 *
 * Leaves are the only assignable rows — child slots (parent_plot_id IS NOT NULL)
 * or single-capacity plots (capacity = 1). Parent CONTAINERS are excluded so
 * "Available" reflects real bookable inventory, not container rows that carry
 * NULL status and would skew the totals.
 *
 * Returns a status-keyed payload (`available`, `occupied`, `reserved`,
 * `maintenance`) plus `total` (sum of leaves). One aggregate SQL query — no
 * row hydration — so it stays cheap to call alongside the paginated list.
 */
class GetPlotInventoryCountsAction
{
    /**
     * @return array{total:int, available:int, occupied:int, reserved:int, maintenance:int}
     */
    public function execute(string $municipalId, string $cemeterySiteId): array
    {
        $rows = Plot::query()
            ->where('municipal_id', $municipalId)
            ->where('cemetery_site_id', $cemeterySiteId)
            // Leaf-only filter — children OR single-capacity plots.
            ->where(function ($query) {
                $query->whereNotNull('parent_plot_id')
                    ->orWhere('capacity', 1);
            })
            ->selectRaw('status, COUNT(*) AS total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $counts = [
            'available' => (int) ($rows['available'] ?? 0),
            'occupied' => (int) ($rows['occupied'] ?? 0),
            'reserved' => (int) ($rows['reserved'] ?? 0),
            'maintenance' => (int) ($rows['maintenance'] ?? 0),
        ];

        $counts['total'] = array_sum($counts);

        return $counts;
    }
}
