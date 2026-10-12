<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Dto\ProgramItemDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Services\ProgramItemService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;

final class CreateProgramItemAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly ProgramItemService $programs,
        private readonly ManageCatalogAction $catalog, private readonly ManageProgramItemAction $membership) {}

    public function execute(string $programId, CatalogDto $dto): ProgramItem
    {
        if ($dto->kind !== CatalogKind::Items || $dto->recordId !== null) {
            throw new \InvalidArgumentException('Program item creation requires a new item.');
        }

        return DB::transaction(function () use ($programId, $dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $this->programs->activeProgram($dto->municipalId, $programId);
            $item = $this->catalog->execute(new CatalogDto($dto->municipalId, $dto->actorId, CatalogKind::Items, [...$dto->data, 'is_active' => true]));

            return $this->membership->execute(new ProgramItemDto($dto->municipalId, $dto->actorId, $programId, $item->id));
        });
    }
}
