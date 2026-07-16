<?php

namespace App\Core\Cemetery\Actions\Reports;

use App\Core\Cemetery\Dto\Reports\PlotInventoryReportFiltersDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListPlotInventoryReportAction
{
    public function execute(string $municipalId, PlotInventoryReportFiltersDto $filters): LengthAwarePaginator
    {
        return $this->baseQuery($municipalId, $filters)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn (Plot $plot) => $this->mapRow($plot));
    }

    public function rowsForExport(string $municipalId, PlotInventoryReportFiltersDto $filters): array
    {
        return $this->baseQuery($municipalId, $filters)
            ->get()
            ->map(fn (Plot $plot) => $this->mapRow($plot))
            ->values()
            ->all();
    }

    public function summary(string $municipalId, PlotInventoryReportFiltersDto $filters): array
    {
        $rows = collect($this->rowsForExport($municipalId, $filters));

        return [
            'total' => $rows->count(),
            'available' => $rows->where('status', 'available')->count(),
            'occupied' => $rows->where('status', 'occupied')->count(),
            'maintenance' => $rows->where('status', 'maintenance')->count(),
            'containers' => $rows->where('occupancy_mode', PlotOccupancyMode::SLOTTED->value)->count(),
        ];
    }

    public function headings(): array
    {
        return [
            'Site',
            'Section',
            'Block',
            'Plot',
            'Type',
            'Status',
            'Occupancy Mode',
            'Active Interments',
            'Capacity',
            'Remaining Capacity',
            'Area SQM',
        ];
    }

    public function exportRows(string $municipalId, PlotInventoryReportFiltersDto $filters): array
    {
        return collect($this->rowsForExport($municipalId, $filters))
            ->map(fn (array $row) => [
                $row['site_name'],
                $row['section_name'],
                $row['block_name'],
                $row['plot_label'],
                $row['type_label'],
                $row['status_label'],
                $row['occupancy_mode_label'],
                $row['active_interments_count'],
                $row['capacity'],
                $row['remaining_capacity'],
                $row['area_sqm'],
            ])
            ->all();
    }

    private function baseQuery(string $municipalId, PlotInventoryReportFiltersDto $filters): Builder
    {
        return Plot::query()
            ->with(['cemeterySite', 'block.section'])
            ->withCount([
                'interments as active_interments_count' => fn (Builder $query) => $query->active(),
                'slots as occupied_slots_count' => fn (Builder $query) => $query
                    ->whereHas('interments', fn (Builder $intermentQuery) => $intermentQuery->active()),
            ])
            ->where('municipal_id', $municipalId)
            ->when($filters->siteId, fn (Builder $query, string $siteId) => $query->where('cemetery_site_id', $siteId))
            ->when($filters->blockId, fn (Builder $query, string $blockId) => $query->where('block_id', $blockId))
            ->when($filters->sectionId, fn (Builder $query, string $sectionId) => $query
                ->whereHas('block', fn (Builder $blockQuery) => $blockQuery->where('section_id', $sectionId)))
            ->when($filters->type, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters->status, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters->occupancyMode, fn (Builder $query, string $mode) => $query->where('occupancy_mode', $mode))
            ->when($filters->scope === PlotInventoryReportFiltersDto::SCOPE_ASSIGNABLE, fn (Builder $query) => $query
                ->whereNotNull('status')
                ->where('occupancy_mode', '!=', PlotOccupancyMode::SLOTTED->value))
            ->when($filters->scope === PlotInventoryReportFiltersDto::SCOPE_CONTAINERS, fn (Builder $query) => $query
                ->where('occupancy_mode', PlotOccupancyMode::SLOTTED->value))
            ->orderBy('cemetery_site_id')
            ->orderBy('name')
            ->orderBy('level')
            ->orderBy('row')
            ->orderBy('position');
    }

    private function mapRow(Plot $plot): array
    {
        $isContainer = $plot->occupancy_mode === PlotOccupancyMode::SLOTTED;
        $activeCount = $isContainer
            ? (int) ($plot->occupied_slots_count ?? 0)
            : (int) ($plot->active_interments_count ?? 0);

        return [
            'plot_id' => $plot->id,
            'site_name' => $plot->cemeterySite?->name,
            'section_name' => $plot->block?->section?->name,
            'block_name' => $plot->block?->name,
            'plot_label' => $plot->slotLabel,
            'type' => $plot->type?->value,
            'type_label' => $plot->type?->label(),
            'status' => $plot->status?->value,
            'status_label' => $plot->status?->label(),
            'occupancy_mode' => $plot->occupancy_mode?->value,
            'occupancy_mode_label' => $plot->occupancy_mode?->label(),
            'active_interments_count' => $activeCount,
            'capacity' => (int) $plot->capacity,
            'remaining_capacity' => max(0, (int) $plot->capacity - $activeCount),
            'area_sqm' => $plot->area_sqm,
        ];
    }
}
