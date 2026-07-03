<?php

namespace App\Core\Cemetery\Actions\Interments;

use App\Core\Cemetery\Actions\Plots\RecalculatePlotStatusAction;
use App\Core\Cemetery\Dto\Interments\ReverseMovedIntermentDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReverseMovedIntermentAction
{
    public function __construct(
        private RecalculatePlotStatusAction $recalculatePlotStatus,
    ) {}

    public function execute(ReverseMovedIntermentDto $dto): Interment
    {
        return DB::transaction(function () use ($dto) {
            $transfer = Interment::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($dto->intermentId);

            $this->assertReversible($transfer);

            $previous = Interment::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($transfer->previous_interment_id);

            $destinationPlot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($transfer->plot_id);

            $previousPlot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($previous->plot_id);

            $this->assertPreviousCanBeRestored($previous, $previousPlot);

            $transfer->forceFill([
                'voided_at' => now(),
                'voided_by' => auth()->id(),
                'void_reason' => $dto->reason,
            ])->save();

            $previous->forceFill([
                'ended_at' => null,
                'ended_by' => null,
                'end_type' => null,
                'end_reason' => null,
                'end_notes' => null,
                'permit_reference' => null,
                'transfer_destination' => null,
            ])->save();

            $this->recalculatePlotStatus->execute($destinationPlot);
            $this->recalculatePlotStatus->execute($previousPlot);

            activity('cemetery_interment')
                ->performedOn($transfer)
                ->causedBy(auth()->user())
                ->event('interment_move_reversed')
                ->withProperties([
                    'reason' => $dto->reason,
                    'voided_interment_id' => $transfer->id,
                    'restored_interment_id' => $previous->id,
                    'destination_plot_id' => $destinationPlot->id,
                    'restored_plot_id' => $previousPlot->id,
                ])
                ->log('Interment move reversed');

            return $previous;
        });
    }

    private function assertReversible(Interment $transfer): void
    {
        if ($transfer->ended_at !== null || $transfer->voided_at !== null || $transfer->trashed()) {
            throw ValidationException::withMessages([
                'interment' => 'Only an active transfer interment can be reversed.',
            ]);
        }

        if ($transfer->type !== 'transfer' || $transfer->previous_interment_id === null) {
            throw ValidationException::withMessages([
                'interment' => 'Only moved interments can be reversed.',
            ]);
        }
    }

    private function assertPreviousCanBeRestored(Interment $previous, Plot $plot): void
    {
        if ($previous->ended_at === null || $previous->voided_at !== null || $previous->trashed()) {
            throw ValidationException::withMessages([
                'interment' => 'The previous interment cannot be restored.',
            ]);
        }

        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            throw ValidationException::withMessages([
                'interment' => 'The previous plot is a parent container and cannot receive interments.',
            ]);
        }

        $activeCount = $plot->interments()->active()->count();
        $capacity = max(1, (int) $plot->capacity);

        if ($plot->occupancy_mode === PlotOccupancyMode::SINGLE) {
            if ($plot->status !== PlotStatus::AVAILABLE || $activeCount > 0) {
                throw ValidationException::withMessages([
                    'interment' => 'The previous plot can no longer accept the restored interment.',
                ]);
            }

            return;
        }

        if ($plot->occupancy_mode === PlotOccupancyMode::SHARED) {
            if (! in_array($plot->status, [PlotStatus::AVAILABLE, PlotStatus::OCCUPIED], true) || $activeCount >= $capacity) {
                throw ValidationException::withMessages([
                    'interment' => 'The previous plot can no longer accept the restored interment.',
                ]);
            }
        }
    }
}
