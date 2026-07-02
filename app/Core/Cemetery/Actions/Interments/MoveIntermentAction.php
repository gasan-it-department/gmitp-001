<?php

namespace App\Core\Cemetery\Actions\Interments;

use App\Core\Cemetery\Actions\Plots\RecalculatePlotStatusAction;
use App\Core\Cemetery\Dto\Interments\MoveIntermentDto;
use App\Core\Cemetery\Enums\CemeterySiteStatus;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MoveIntermentAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private RecalculatePlotStatusAction $recalculatePlotStatus,
    ) {}

    public function execute(MoveIntermentDto $dto): Interment
    {
        return DB::transaction(function () use ($dto) {
            $interment = Interment::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($dto->intermentId);

            $this->assertActive($interment);
            $this->assertDestinationSite($dto);

            $sourcePlot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($interment->plot_id);

            $destinationPlot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->destinationCemeterySiteId)
                ->lockForUpdate()
                ->findOrFail($dto->destinationPlotId);

            $this->assertDestinationPlot($interment, $destinationPlot);

            $movementAt = Carbon::parse($dto->movementDate)->startOfDay();

            $interment->forceFill([
                'ended_at' => $movementAt,
                'ended_by' => auth()->id(),
                'end_reason' => $dto->reason,
                'end_notes' => $dto->notes,
            ])->save();

            $transfer = Interment::query()->create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'decedent_id' => $interment->decedent_id,
                'plot_id' => $destinationPlot->id,
                'previous_interment_id' => $interment->id,
                'interment_date' => $dto->movementDate,
                'type' => 'transfer',
                'notes' => $dto->notes,
            ]);

            $this->recalculatePlotStatus->execute($sourcePlot);
            $this->recalculatePlotStatus->execute($destinationPlot);

            activity('cemetery_interment')
                ->performedOn($transfer)
                ->causedBy(auth()->user())
                ->event('interment_moved')
                ->withProperties([
                    'reason' => $dto->reason,
                    'notes' => $dto->notes,
                    'movement_date' => $dto->movementDate,
                    'previous_interment_id' => $interment->id,
                    'decedent_id' => $interment->decedent_id,
                    'source_plot_id' => $sourcePlot->id,
                    'destination_plot_id' => $destinationPlot->id,
                ])
                ->log('Interment moved to another plot');

            return $transfer;
        });
    }

    private function assertActive(Interment $interment): void
    {
        if ($interment->ended_at !== null || $interment->voided_at !== null || $interment->trashed()) {
            throw ValidationException::withMessages([
                'interment' => 'Only active interments can be moved.',
            ]);
        }
    }

    private function assertDestinationSite(MoveIntermentDto $dto): void
    {
        CemeterySite::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('status', CemeterySiteStatus::ACTIVE->value)
            ->findOrFail($dto->destinationCemeterySiteId);
    }

    private function assertDestinationPlot(Interment $interment, Plot $plot): void
    {
        if ($interment->plot_id === $plot->id) {
            throw ValidationException::withMessages([
                'destination_plot_id' => 'Choose a different destination plot.',
            ]);
        }

        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            throw ValidationException::withMessages([
                'destination_plot_id' => 'Apartment parent containers cannot receive interments. Pick a child niche.',
            ]);
        }

        $activeCount = $plot->interments()->active()->count();
        $capacity = max(1, (int) $plot->capacity);

        if ($plot->occupancy_mode === PlotOccupancyMode::SINGLE) {
            if ($plot->status !== PlotStatus::AVAILABLE || $activeCount > 0) {
                throw ValidationException::withMessages([
                    'destination_plot_id' => 'The destination plot is not available.',
                ]);
            }

            return;
        }

        if ($plot->occupancy_mode === PlotOccupancyMode::SHARED) {
            if (! in_array($plot->status, [PlotStatus::AVAILABLE, PlotStatus::OCCUPIED], true) || $activeCount >= $capacity) {
                throw ValidationException::withMessages([
                    'destination_plot_id' => "The destination plot is already full ({$activeCount}/{$capacity}) or not assignable.",
                ]);
            }
        }
    }
}
