<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Dto\ProgramItemDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class ManageProgramItemAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly ManageCatalogAction $catalog) {}

    public function execute(ProgramItemDto $dto): ProgramItem
    {
        return DB::transaction(function () use ($dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $program = Program::query()->where('municipal_id', $dto->municipalId)->whereKey($dto->programId)->firstOrFail();
            $item = Item::query()->where('municipal_id', $dto->municipalId)->whereKey($dto->itemId)->firstOrFail();
            if ($dto->isActive && ! $program->is_active) {
                throw ValidationException::withMessages(['program_id' => 'An inactive program cannot enable items.']);
            }
            if ($dto->isActive && ! $item->is_active) {
                if (! $dto->reactivateGlobal) {
                    throw ValidationException::withMessages(['reactivate_global' => 'Confirm global item reactivation before enabling it for this program.']);
                }
                $this->catalog->execute(new CatalogDto($dto->municipalId, $dto->actorId, CatalogKind::Items,
                    [...$item->only(CatalogKind::Items->fields()), 'is_active' => true, 'confirm_shared_change' => true], $item->id));
            }
            $membership = ProgramItem::query()->where('municipal_id', $dto->municipalId)->where('program_id', $program->id)->where('item_id', $item->id)->lockForUpdate()->first();
            if (! $membership && ! $dto->isActive) {
                throw ValidationException::withMessages(['item_id' => 'This item is not in the program catalog.']);
            }
            if ($membership && $membership->is_active === $dto->isActive) {
                return $membership->load('item.programItems.program');
            }
            $before = $membership?->only(['program_id', 'item_id', 'is_active']) ?? [];
            $membership ??= new ProgramItem;
            $membership->fill(['municipal_id' => $dto->municipalId, 'program_id' => $program->id, 'item_id' => $item->id, 'is_active' => $dto->isActive])->save();
            $this->ledger->audit($membership, $dto->actorId, $before ? 'Changed program item availability' : 'Added item to program catalog', $before, $membership->only(['program_id', 'item_id', 'is_active']));

            return $membership->load('item.programItems.program');
        });
    }
}
