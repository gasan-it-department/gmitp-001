<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

final class UpdateProgramCooldownAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly DistributionRequestService $requests, private readonly ManageCatalogAction $catalog) {}

    public function execute(string $municipalId, string $programId, string $actorId, array $data): Program
    {
        return DB::transaction(function () use ($municipalId, $programId, $actorId, $data) {
            $this->ledger->lockMunicipality($municipalId);
            $this->requests->actor($municipalId, $actorId, 'goods_distribution.inventory.manage');
            $program = Program::query()->where('municipal_id', $municipalId)->whereKey($programId)->lockForUpdate()->firstOrFail();

            return $this->catalog->execute(new CatalogDto($municipalId, $actorId, CatalogKind::Programs, [
                ...$program->only(['name', 'description', 'is_active']),
                ...Arr::only($data, ['cooldown_enabled', 'cooldown_scope', 'cooldown_duration', 'cooldown_unit']),
            ], $programId));
        });
    }
}
