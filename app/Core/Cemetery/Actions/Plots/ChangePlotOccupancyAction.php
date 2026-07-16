<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\ChangePlotOccupancyDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChangePlotOccupancyAction
{
    public function execute(ChangePlotOccupancyDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->cemeterySiteId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $activeCount = $plot->interments()->active()->count();
            $oldValues = [
                'occupancy_mode' => $plot->occupancy_mode?->value,
                'capacity' => $plot->capacity,
            ];

            $this->assertAllowed($plot, $dto, $activeCount);

            $nextCapacity = $dto->occupancyMode === PlotOccupancyMode::SINGLE->value ? 1 : $dto->capacity;

            $plot->forceFill([
                'occupancy_mode' => $dto->occupancyMode,
                'capacity' => $nextCapacity,
            ])->save();

            activity('cemetery_plot')
                ->performedOn($plot)
                ->causedBy(auth()->user())
                ->event('occupancy_changed')
                ->withProperties([
                    'reason' => $dto->reason,
                    'active_interments_count' => $activeCount,
                    'old' => $oldValues,
                    'new' => [
                        'occupancy_mode' => $dto->occupancyMode,
                        'capacity' => $nextCapacity,
                    ],
                ])
                ->log('Plot occupancy changed');

            return $plot;
        });
    }

    private function assertAllowed(Plot $plot, ChangePlotOccupancyDto $dto, int $activeCount): void
    {
        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            throw ValidationException::withMessages([
                'occupancy_mode' => 'Apartment parent containers cannot be changed through occupancy editing.',
            ]);
        }

        if ($dto->occupancyMode === PlotOccupancyMode::SINGLE->value && $activeCount > 1) {
            throw ValidationException::withMessages([
                'occupancy_mode' => 'A shared plot with more than one active interment cannot be changed to single occupancy.',
            ]);
        }

        if ($dto->occupancyMode === PlotOccupancyMode::SHARED->value && $dto->capacity < 2) {
            throw ValidationException::withMessages([
                'capacity' => 'Shared occupancy requires capacity of at least 2.',
            ]);
        }

        if ($dto->occupancyMode === PlotOccupancyMode::SHARED->value && $dto->capacity < $activeCount) {
            throw ValidationException::withMessages([
                'capacity' => 'Capacity cannot be lower than the current active interment count.',
            ]);
        }
    }
}
