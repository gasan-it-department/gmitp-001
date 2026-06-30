<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\GenerateApartmentNichesDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\Core\Cemetery\Models\Block;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GenerateApartmentNichesAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(GenerateApartmentNichesDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            CemeterySite::query()
                ->forMunicipality($dto->municipalId)
                ->where('status', 'active')
                ->lockForUpdate()
                ->findOrFail($dto->cemeterySiteId);

            $block = Block::query()
                ->with('section:id,municipal_id,cemetery_site_id,status')
                ->where('municipal_id', $dto->municipalId)
                ->where('status', 'active')
                ->whereHas('section', fn ($query) => $query
                    ->where('municipal_id', $dto->municipalId)
                    ->where('cemetery_site_id', $dto->cemeterySiteId)
                    ->where('status', 'active'))
                ->lockForUpdate()
                ->findOrFail($dto->blockId);

            $cemeterySiteId = $block->section->cemetery_site_id;

            $this->assertNoDuplicateParent($dto);
            $this->assertNoDuplicateSlots($dto);

            $parent = Plot::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'cemetery_site_id' => $cemeterySiteId,
                'block_id' => $dto->blockId,
                'parent_plot_id' => null,
                'name' => $dto->apartmentName,
                'type' => PlotTypes::APARTMENT_NICHE->value,
                'status' => null,
                'occupancy_mode' => PlotOccupancyMode::SLOTTED->value,
                'row' => null,
                'level' => null,
                'position' => null,
                'capacity' => $dto->totalSlots(),
            ]);

            foreach ($dto->generatedSlots() as $slot) {
                Plot::create([
                    'id' => $this->idGenerator->generate(),
                    'municipal_id' => $dto->municipalId,
                    'cemetery_site_id' => $cemeterySiteId,
                    'block_id' => $dto->blockId,
                    'parent_plot_id' => $parent->id,
                    'name' => $dto->apartmentName,
                    'type' => PlotTypes::APARTMENT_NICHE->value,
                    'status' => PlotStatus::AVAILABLE->value,
                    'occupancy_mode' => PlotOccupancyMode::SHARED->value,
                    'row' => $slot['row'],
                    'level' => $slot['level'],
                    'position' => $slot['position'],
                    'capacity' => $dto->capacityPerNiche,
                ]);
            }

            return $parent->fresh('slots');
        });
    }

    private function assertNoDuplicateParent(GenerateApartmentNichesDto $dto): void
    {
        $exists = Plot::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('block_id', $dto->blockId)
            ->whereNull('parent_plot_id')
            ->where('name', $dto->apartmentName)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'apartment_name' => 'An apartment or plot with this name already exists in the selected block.',
            ]);
        }
    }

    private function assertNoDuplicateSlots(GenerateApartmentNichesDto $dto): void
    {
        $duplicates = [];

        foreach ($dto->generatedSlots() as $slot) {
            $exists = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('block_id', $dto->blockId)
                ->where('name', $dto->apartmentName)
                ->where('level', $slot['level'])
                ->where('row', $slot['row'])
                ->where('position', $slot['position'])
                ->exists();

            if ($exists) {
                $duplicates[] = 'F'.$slot['level'].'-'.$slot['row'].'-'.$slot['position'];
            }
        }

        if ($duplicates !== []) {
            throw ValidationException::withMessages([
                'apartment_name' => 'Some apartment niche slots already exist: '.implode(', ', array_slice($duplicates, 0, 5)).'.',
            ]);
        }
    }
}
