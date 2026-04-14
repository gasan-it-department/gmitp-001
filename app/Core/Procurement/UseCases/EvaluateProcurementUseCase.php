<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;

class EvaluateProcurementUseCase
{
    public function __construct(
        protected ProcurementsRepository $procurementsRepo,
    ) {
    }

    public function execute(string $municipalId, string $procurementId, ?string $remarks = null): void
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $municipalId);

        if (!$procurement) {
            throw new ProcurementDomainException("Procurement not found.");
        }

        if ($procurement->status !== ProcurementStatus::OPEN) {
            throw new ProcurementDomainException(
                "Action Denied: Only 'Open' projects can be moved to the Evaluation phase."
            );
        }

        $payload = [
            'status' => ProcurementStatus::EVALUATING,
        ];

        $appendedNotes = null;
        if ($remarks) {
            $timestamp = now()->format('Y-m-d h:i A');
            $existingNotes = $procurement->notes ? $procurement->notes . "\n\n" : "";
            $appendedNotes = $existingNotes . "--- BAC Evaluation [{$timestamp}] ---\n" . $remarks;
        }

        $this->procurementsRepo->transitionStatus($procurementId, ProcurementStatus::EVALUATING, $appendedNotes);
    }
}