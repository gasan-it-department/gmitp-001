<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Dto\Plots\PlotListFiltersDto;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListPlotsAction
{
    public function execute(
        string $municipalId,
        string $cemeterySiteId,
        ?PlotListFiltersDto $filters = null,
    ): LengthAwarePaginator {
        $filters ??= new PlotListFiltersDto(
            search: null,
            status: null,
            type: null,
            sectionId: null,
            blockId: null,
            row: null,
        );

        return Plot::with(['block.section'])
            ->withCount([
                'interments' => fn (Builder $query) => $query->active(),
                'slots as occupied_slots_count' => fn (Builder $query) => $query
                    ->whereHas('interments', fn (Builder $intermentQuery) => $intermentQuery->active()),
            ])
            ->where('municipal_id', $municipalId)
            ->where('cemetery_site_id', $cemeterySiteId)
            ->when($filters->scope === PlotListFiltersDto::SCOPE_TOP_LEVEL, fn (Builder $query) => $query
                ->whereNull('parent_plot_id'))
            ->when($filters->scope === PlotListFiltersDto::SCOPE_ASSIGNABLE, fn (Builder $query) => $query
                ->whereNotNull('status')
                ->whereDoesntHave('slots'))
            ->when($filters->status, fn (Builder $query, string $status) => $query
                ->where('status', $status))
            ->when($filters->type, fn (Builder $query, string $type) => $query
                ->where('type', $type))
            ->when($filters->blockId, fn (Builder $query, string $blockId) => $query
                ->where('block_id', $blockId))
            ->when($filters->sectionId, fn (Builder $query, string $sectionId) => $query
                ->whereHas('block', fn (Builder $blockQuery) => $blockQuery
                    ->where('section_id', $sectionId)))
            ->when($filters->row, fn (Builder $query, string $row) => $query
                ->whereRaw('LOWER(row) = ?', [mb_strtolower($row)]))
            ->when($filters->search, fn (Builder $query, string $search) => $this->applySearch($query, $search))
            ->orderBy('name')
            ->orderBy('level')
            ->orderBy('row')
            ->orderBy('position')
            ->paginate($filters->perPage)
            ->withQueryString();
    }

    private function applySearch(Builder $query, string $search): void
    {
        $term = '%'.mb_strtolower(trim($search)).'%';

        $query->where(function (Builder $query) use ($term): void {
            $query
                ->whereRaw('LOWER(name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(row) LIKE ?', [$term])
                ->orWhereRaw('LOWER(position) LIKE ?', [$term])
                ->orWhereHas('block', fn (Builder $blockQuery) => $blockQuery
                    ->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereHas('section', fn (Builder $sectionQuery) => $sectionQuery
                        ->whereRaw('LOWER(name) LIKE ?', [$term])));
        });
    }
}
