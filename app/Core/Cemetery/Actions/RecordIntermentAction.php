<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\Enums\IntermentEndType;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\IntermentReadinessOverride;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
            $this->assertDecedentHasNoFinalOutcome($dto);

            $readiness = $this->getIntermentReadiness->execute($decedent);
            if (! $readiness['registration_verified']) {
                throw ValidationException::withMessages([
                    'decedent_id' => 'This decedent must be verified before interment.',
                ]);
            }

            if (! $readiness['document_complete']) {
                $this->assertPendingDocumentAuthorization($dto);
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

            $plot->status = PlotStatus::OCCUPIED;
            $plot->save();

            if (! $readiness['document_complete']) {
                IntermentReadinessOverride::create([
                    'id' => $this->idGenerator->generate(),
                    'municipal_id' => $dto->municipalId,
                    'decedent_id' => $decedent->id,
                    'missing_requirements' => $readiness['missing'],
                    'reason' => $dto->pendingDocumentReason,
                    'evidence_reference' => mb_strtoupper($dto->pendingDocumentReference ?? ''),
                    'consumed_at' => now(),
                    'created_by' => auth()->id(),
                    'consumed_by' => auth()->id(),
                    'consumed_by_interment_id' => $interment->id,
                ]);
            }

            return $interment;
        });
    }

    private function assertPendingDocumentAuthorization(IntermentDto $dto): void
    {
        $messages = [];

        if ($dto->pendingDocumentReason === null) {
            $messages['pending_document_reason'] = 'Enter why interment is allowed while documents are pending.';
        }

        if ($dto->pendingDocumentReference === null) {
            $messages['pending_document_reference'] = 'Enter the admin approval, logbook, or follow-up reference.';
        }

        if (! $dto->pendingDocumentConfirmed) {
            $messages['pending_document_confirmed'] = 'Confirm that this pending-document authorization should be recorded.';
        }

        if (auth()->id() === null) {
            $messages['pending_document_confirmed'] = 'An authenticated staff user is required to authorize pending-document interment.';
        }

        if ($messages !== []) {
            throw ValidationException::withMessages($messages);
        }
    }

    private function assertAssignable(Plot $plot): void
    {
        if ($plot->occupancy_mode === PlotOccupancyMode::SLOTTED) {
            throw new RuntimeException(
                "Plot {$plot->id} is a parent container; pick an assignable child niche."
            );
        }

        $activeCount = $plot->interments()->active()->count();
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
            ->active()
            ->exists();

        if ($hasActive) {
            throw new RuntimeException(
                "Decedent {$dto->decedentId} already has an active interment."
            );
        }
    }

    private function assertDecedentHasNoFinalOutcome(IntermentDto $dto): void
    {
        $hasFinalOutcome = Interment::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('decedent_id', $dto->decedentId)
            ->whereIn('end_type', [
                IntermentEndType::EXHUMED->value,
                IntermentEndType::TRANSFERRED_OUT->value,
            ])
            ->exists();

        if ($hasFinalOutcome) {
            throw ValidationException::withMessages([
                'decedent_id' => 'This decedent has a final cemetery outcome and cannot be assigned through normal interment creation.',
            ]);
        }
    }
}
