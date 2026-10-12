<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Models\ProgramItem;
use Illuminate\Pagination\LengthAwarePaginator;

final class ReadProgramItemsAction
{
    public function execute(string $municipalId, string $programId, InventoryFiltersDto $filters): LengthAwarePaginator
    {
        $query = ProgramItem::query()->where('municipal_id', $municipalId)->where('program_id', $programId)
            ->with(['item' => fn ($query) => $query->withExists('receiptLines as base_unit_locked'), 'item.programItems.program']);
        if ($filters->get('active')) {
            $query->where('is_active', $filters->get('active') === 'active');
        }
        if ($filters->get('search')) {
            $term = '%'.mb_strtolower($filters->get('search')).'%';
            $query->whereHas('item', fn ($query) => $query->where(fn ($query) => $query->whereRaw('LOWER(name) LIKE ?', [$term])->orWhereRaw('LOWER(code) LIKE ?', [$term])));
        }

        return $query->orderBy('id')->paginate(20)->withQueryString();
    }
}
