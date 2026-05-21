<?php

namespace App\Core\Cemetery\Repositories;

use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Persistence boundary for cemetery_plots. Every read/write is municipal_id-scoped.
 */
class PlotsRepository
{
    public function create(PlotDto $dto, string $plotId): Plot
    {
        return Plot::create([
            'id' => $plotId,
            'municipal_id' => $dto->municipalId,
            'section_id' => $dto->sectionId,
            'plot_number' => $dto->plotNumber,
            'name' => $dto->name,
            'type' => $dto->type,
            'status' => $dto->status,
            'total_capacity' => $dto->totalCapacity,
        ]);
    }

    public function findByIdForMunicipality(string $municipalId, string $plotId): Plot
    {
        return Plot::with(['section', 'activeInterment.decedent'])
            ->where('municipal_id', $municipalId)
            ->findOrFail($plotId);
    }

    public function paginateByMunicipality(string $municipalId, ?string $statusFilter = null, int $perPage = 15): LengthAwarePaginator
    {
        return Plot::with('section')
            ->where('municipal_id', $municipalId)
            ->when($statusFilter, fn ($q) => $q->where('status', $statusFilter))
            ->orderBy('plot_number')
            ->paginate($perPage);
    }

    /**
     * Available plots for the assign-decedent UI. Filtered by status only — the
     * frontend can further narrow by type via the same endpoint when needed.
     */
    public function listAvailableByMunicipality(string $municipalId): Collection
    {
        return Plot::with('section')
            ->where('municipal_id', $municipalId)
            ->where('status', PlotStatus::AVAILABLE->value)
            ->orderBy('plot_number')
            ->get();
    }

    /**
     * Atomically flip a plot's status. Used by the interment lifecycle flows.
     * Returns the number of rows affected so the caller can detect contention.
     */
    public function updateStatus(string $municipalId, string $plotId, string $newStatus): int
    {
        return Plot::where('municipal_id', $municipalId)
            ->where('id', $plotId)
            ->update(['status' => $newStatus]);
    }
}
