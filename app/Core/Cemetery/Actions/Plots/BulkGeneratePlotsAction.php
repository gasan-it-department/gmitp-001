<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Actions\BulkGenerateMultiCapacityPlotsAction;
use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\Dto\Plots\BulkGeneratePlotsDto;
use App\Core\Cemetery\Models\Block;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BulkGeneratePlotsAction
{
    public function __construct(
        private BulkGenerateMultiCapacityPlotsAction $createPlot,
    ) {}

    /**
     * @return array<int, Plot>
     */
    public function execute(BulkGeneratePlotsDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            CemeterySite::query()
                ->forMunicipality($dto->municipalId)
                ->where('status', 'active')
                ->lockForUpdate()
                ->findOrFail($dto->cemeterySiteId);

            Block::query()
                ->with('section:id,municipal_id,cemetery_site_id,status')
                ->where('municipal_id', $dto->municipalId)
                ->where('status', 'active')
                ->whereHas('section', fn ($query) => $query
                    ->where('municipal_id', $dto->municipalId)
                    ->where('cemetery_site_id', $dto->cemeterySiteId)
                    ->where('status', 'active'))
                ->lockForUpdate()
                ->findOrFail($dto->blockId);

            $names = $dto->generatedNames();
            $existing = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('block_id', $dto->blockId)
                ->whereNull('parent_plot_id')
                ->whereIn('name', $names)
                ->pluck('name')
                ->all();

            if ($existing !== []) {
                throw ValidationException::withMessages([
                    'label_prefix' => 'Some generated plots already exist in this block: '.implode(', ', array_slice($existing, 0, 5)).'.',
                ]);
            }

            $created = [];

            foreach ($names as $name) {
                $created[] = $this->createPlot->execute(new PlotDto(
                    municipalId: $dto->municipalId,
                    blockId: $dto->blockId,
                    name: $name,
                    type: $dto->type,
                    capacity: $dto->capacity,
                    row: $dto->row,
                    position: $dto->position,
                    cemeterySiteId: $dto->cemeterySiteId,
                ));
            }

            return $created;
        });
    }
}
