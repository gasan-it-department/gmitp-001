<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\ChangePlotStatusDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChangePlotStatusAction
{
    public function execute(ChangePlotStatusDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->cemeterySiteId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $activeCount = $plot->interments()->count();
            $this->assertAllowed($plot, $dto, $activeCount);

            $oldStatus = $plot->status?->value;

            $plot->forceFill([
                'status' => $dto->status,
            ])->save();

            activity('cemetery_plot')
                ->performedOn($plot)
                ->causedBy(auth()->user())
                ->event('status_changed')
                ->withProperties([
                    'reason' => $dto->reason,
                    'active_interments_count' => $activeCount,
                    'old' => ['status' => $oldStatus],
                    'new' => ['status' => $dto->status],
                ])
                ->log('Plot status changed');

            return $plot;
        });
    }

    private function assertAllowed(Plot $plot, ChangePlotStatusDto $dto, int $activeCount): void
    {
        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            throw ValidationException::withMessages([
                'status' => 'Apartment parent containers do not have manual availability status.',
            ]);
        }

        if ($activeCount > 0) {
            throw ValidationException::withMessages([
                'status' => 'Status can only be changed manually for empty plots.',
            ]);
        }

        if (! in_array($dto->status, [PlotStatus::AVAILABLE->value, PlotStatus::MAINTENANCE->value], true)) {
            throw ValidationException::withMessages([
                'status' => 'Only available and maintenance can be set manually in V1.',
            ]);
        }
    }
}
