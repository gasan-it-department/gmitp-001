<?php

namespace App\Core\Cemetery\Actions\Interments;

use App\Core\Cemetery\Actions\Plots\RecalculatePlotStatusAction;
use App\Core\Cemetery\Dto\Interments\CloseIntermentDto;
use App\Core\Cemetery\Enums\IntermentEndType;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\Plot;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CloseIntermentAction
{
    public function __construct(
        private RecalculatePlotStatusAction $recalculatePlotStatus,
    ) {}

    public function execute(CloseIntermentDto $dto): Interment
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

            $endedAt = Carbon::parse($dto->endedDate)->startOfDay();

            $interment->forceFill([
                'ended_at' => $endedAt,
                'ended_by' => auth()->id(),
                'end_type' => $dto->endType,
                'end_reason' => $dto->reason,
                'end_notes' => $dto->notes,
                'permit_reference' => $dto->permitReference,
                'transfer_destination' => $dto->endType === IntermentEndType::TRANSFERRED_OUT->value
                    ? $dto->transferDestination
                    : null,
            ])->save();

            $this->recalculatePlotStatus->execute($plot);

            activity('cemetery_interment')
                ->performedOn($interment)
                ->causedBy(auth()->user())
                ->event('interment_closed')
                ->withProperties([
                    'end_type' => $dto->endType,
                    'ended_date' => $dto->endedDate,
                    'reason' => $dto->reason,
                    'notes' => $dto->notes,
                    'permit_reference' => $dto->permitReference,
                    'transfer_destination' => $dto->transferDestination,
                    'decedent_id' => $interment->decedent_id,
                    'plot_id' => $plot->id,
                ])
                ->log($this->activityDescription($dto->endType));

            return $interment;
        });
    }

    private function assertActive(Interment $interment): void
    {
        if ($interment->ended_at !== null || $interment->voided_at !== null || $interment->trashed()) {
            throw ValidationException::withMessages([
                'interment' => 'Only active interments can be exhumed or transferred out.',
            ]);
        }
    }

    private function activityDescription(string $endType): string
    {
        $label = IntermentEndType::tryFrom($endType)?->label();

        return $label ? "{$label} interment" : 'Interment closed';
    }
}
