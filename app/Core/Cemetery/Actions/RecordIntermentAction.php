<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\IntermentReadinessOverride;
use App\Core\Cemetery\Models\Plot;
use App\Core\Cemetery\Models\PlotLease;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RecordIntermentAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private GetIntermentReadinessAction $getIntermentReadiness,
    ) {}

    public function execute(IntermentDto $dto): Interment
    {
        return DB::transaction(function () use ($dto) {
            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $this->assertAssignable($plot);

            $decedent = Decedent::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($dto->decedentId);

            $this->assertDecedentHasNoActiveInterment($dto);

            $readiness = $this->getIntermentReadiness->execute($decedent);
            if (! $readiness['ready']) {
                $missing = $readiness['registration_verified']
                    ? implode(', ', $readiness['missing'])
                    : 'verified registration';

                throw new RuntimeException(
                    "Decedent {$decedent->id} is not ready for interment. Missing: {$missing}."
                );
            }

            $interment = Interment::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'decedent_id' => $dto->decedentId,
                'plot_id' => $plot->id,
                'interment_date' => $dto->intermentDate,
                'type' => $dto->type,
                'notes' => $dto->notes,
            ]);

            PlotLease::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'interment_id' => $interment->id,
                'plot_id' => $plot->id,
                'leaseholder_name' => $dto->leaseholderName,
                'leaseholder_contact' => $dto->leaseholderContact,
                'leaseholder_address' => $dto->leaseholderAddress,
                'leaseholder_relationship' => $dto->leaseholderRelationship,
                'lease_start' => $dto->leaseStart,
                'lease_end' => $dto->leaseEnd,
                'amount_paid' => $dto->amountPaid,
                'or_number' => $dto->orNumber,
                'status' => PlotLeaseStatus::ACTIVE,
                'notes' => $dto->leaseNotes,
            ]);

            $plot->status = PlotStatus::OCCUPIED;
            $plot->save();

            if ($readiness['via_override']) {
                $override = IntermentReadinessOverride::query()
                    ->where('municipal_id', $dto->municipalId)
                    ->where('decedent_id', $decedent->id)
                    ->whereKey($readiness['override']['id'])
                    ->whereNull('consumed_at')
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $override->isUsable()) {
                    throw new RuntimeException('The readiness override expired or was already consumed.');
                }

                $override->forceFill([
                    'consumed_at' => now(),
                    'consumed_by' => auth()->id(),
                ])->save();
            }

            return $interment;
        });
    }

    private function assertAssignable(Plot $plot): void
    {
        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            throw new RuntimeException(
                "Plot {$plot->id} is a parent container; pick an assignable child niche."
            );
        }

        $activeCount = $plot->interments()->count();
        $capacity = max(1, (int) $plot->capacity);

        if ($plot->occupancy_mode === PlotOccupancyMode::SINGLE) {
            if ($plot->status !== PlotStatus::AVAILABLE || $activeCount > 0) {
                $current = $plot->status?->value ?? 'NULL';
                throw new RuntimeException(
                    "Plot {$plot->id} is not available for another interment (current status: {$current})."
                );
            }

            return;
        }

        if ($plot->occupancy_mode === PlotOccupancyMode::SHARED) {
            if (! in_array($plot->status, [PlotStatus::AVAILABLE, PlotStatus::OCCUPIED], true)) {
                $current = $plot->status?->value ?? 'NULL';
                throw new RuntimeException(
                    "Plot {$plot->id} is not available for interment (current status: {$current})."
                );
            }

            if ($activeCount >= $capacity) {
                throw new RuntimeException(
                    "Plot {$plot->id} is already full ({$activeCount}/{$capacity})."
                );
            }
        }
    }

    private function assertDecedentHasNoActiveInterment(IntermentDto $dto): void
    {
        $hasActive = Interment::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('decedent_id', $dto->decedentId)
            ->exists();

        if ($hasActive) {
            throw new RuntimeException(
                "Decedent {$dto->decedentId} already has an active interment."
            );
        }
    }
}
