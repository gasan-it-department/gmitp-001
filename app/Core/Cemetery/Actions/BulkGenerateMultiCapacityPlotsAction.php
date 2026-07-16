<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Block;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

/**
 * Creates one physical plot row. Capacity means maximum decedents/remains the
 * plot can hold; it does not generate child slots for normal plots.
 */
class BulkGenerateMultiCapacityPlotsAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(PlotDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            CemeterySite::query()
                ->forMunicipality($dto->municipalId)
                ->where('status', 'active')
                ->lockForUpdate()
                ->findOrFail($dto->cemeterySiteId);

            $block = Block::query()
                ->with('section:id,municipal_id,cemetery_site_id')
                ->where('municipal_id', $dto->municipalId)
                ->whereHas('section', fn ($query) => $query
                    ->where('municipal_id', $dto->municipalId)
                    ->where('cemetery_site_id', $dto->cemeterySiteId)
                    ->where('status', 'active'))
                ->lockForUpdate()
                ->findOrFail($dto->blockId);

            return Plot::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'cemetery_site_id' => $block->section->cemetery_site_id,
                'block_id' => $dto->blockId,
                'parent_plot_id' => null,
                'name' => $dto->name,
                'type' => $dto->type,
                'status' => PlotStatus::AVAILABLE->value,
                'occupancy_mode' => $dto->capacity > 1
                    ? PlotOccupancyMode::SHARED->value
                    : PlotOccupancyMode::SINGLE->value,
                'row' => $dto->row,
                'level' => null,
                'position' => $dto->position,
                'capacity' => $dto->capacity,
                'area_sqm' => $dto->areaSqm,
            ]);
        });
    }
}
