<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\AddApartmentNichesDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AddApartmentNichesAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(AddApartmentNichesDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            CemeterySite::query()
                ->forMunicipality($dto->municipalId)
                ->where('status', 'active')
                ->lockForUpdate()
                ->findOrFail($dto->cemeterySiteId);

            $parent = Plot::query()
                ->with('block.section')
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->cemeterySiteId)
                ->whereNull('parent_plot_id')
                ->where('type', PlotTypes::APARTMENT_NICHE->value)
                ->where('occupancy_mode', PlotOccupancyMode::SLOTTED->value)
                ->lockForUpdate()
                ->findOrFail($dto->apartmentParentId);

            if ($parent->block?->status !== 'active' || $parent->block?->section?->status !== 'active') {
                throw ValidationException::withMessages([
                    'plot' => 'Niche slots can only be added inside an active block and section.',
                ]);
            }

            $this->assertNoDuplicateSlots($dto, (string) $parent->name, $parent->block_id);

            foreach ($dto->generatedSlots() as $slot) {
                Plot::create([
                    'id' => $this->idGenerator->generate(),
                    'municipal_id' => $dto->municipalId,
                    'cemetery_site_id' => $dto->cemeterySiteId,
                    'block_id' => $parent->block_id,
                    'parent_plot_id' => $parent->id,
                    'name' => $parent->name,
                    'type' => PlotTypes::APARTMENT_NICHE->value,
                    'status' => PlotStatus::AVAILABLE->value,
                    'occupancy_mode' => PlotOccupancyMode::SHARED->value,
                    'row' => $slot['row'],
                    'level' => $slot['level'],
                    'position' => $slot['position'],
                    'capacity' => $dto->capacityPerNiche,
                ]);
            }

            $parent->update([
                'capacity' => $parent->slots()->count(),
            ]);

            activity('cemetery_plot')
                ->performedOn($parent)
                ->causedBy(auth()->user())
                ->event('apartment_niches_added')
                ->withProperties([
                    'added_slots' => $dto->totalSlots(),
                    'start_floor' => $dto->startFloor,
                    'floors' => $dto->floors,
                    'start_row' => $dto->startRow,
                    'rows_per_floor' => $dto->rowsPerFloor,
                    'start_niche' => $dto->startNiche,
                    'niches_per_row' => $dto->nichesPerRow,
                    'capacity_per_niche' => $dto->capacityPerNiche,
                ])
                ->log('Apartment niche slots added');

            return $parent->fresh('slots');
        });
    }

    private function assertNoDuplicateSlots(AddApartmentNichesDto $dto, string $apartmentName, string $blockId): void
    {
        $duplicates = [];

        foreach ($dto->generatedSlots() as $slot) {
            $exists = Plot::withTrashed()
                ->where('municipal_id', $dto->municipalId)
                ->where('block_id', $blockId)
                ->where('name', $apartmentName)
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
                'start_niche' => 'Some apartment niche slots already exist: '.implode(', ', array_slice($duplicates, 0, 5)).'. Adjust the start floor, row, or niche number.',
            ]);
        }
    }
}
