<?php

namespace App\Core\Cemetery\Actions\Interments;

use App\Core\Cemetery\Actions\Plots\RecalculatePlotStatusAction;
use App\Core\Cemetery\Dto\Interments\VoidIntermentDto;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VoidIntermentAction
{
    public function __construct(
        private RecalculatePlotStatusAction $recalculatePlotStatus,
    ) {}

    public function execute(VoidIntermentDto $dto): Interment
    {
        return DB::transaction(function () use ($dto) {
            $interment = Interment::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($dto->intermentId);

            $this->assertActive($interment);

            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($interment->plot_id);

            $interment->forceFill([
                'voided_at' => now(),
                'voided_by' => auth()->id(),
                'void_reason' => $dto->reason,
            ])->save();

            $this->recalculatePlotStatus->execute($plot);

            activity('cemetery_interment')
                ->performedOn($interment)
                ->causedBy(auth()->user())
                ->event('interment_voided')
                ->withProperties([
                    'reason' => $dto->reason,
                    'interment_id' => $interment->id,
                    'decedent_id' => $interment->decedent_id,
                    'plot_id' => $plot->id,
                ])
                ->log('Interment voided as encoding mistake');

            return $interment;
        });
    }

    private function assertActive(Interment $interment): void
    {
        if ($interment->ended_at !== null || $interment->voided_at !== null || $interment->trashed()) {
            throw ValidationException::withMessages([
                'interment' => 'Only active interments can be voided.',
            ]);
        }
    }
}
