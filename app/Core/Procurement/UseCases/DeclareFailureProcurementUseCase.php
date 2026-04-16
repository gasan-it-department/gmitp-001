<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\FailureProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;

class DeclareFailureProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo,
    ) {
    }

    public function execute(FailureProcurementDto $dto): void
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($dto->procurementId, $dto->municipalId);

        if (!$procurement) {
            throw new ProcurementDomainException("Procurement not found.");
        }

        if (!in_array($procurement->status, [ProcurementStatus::OPEN, ProcurementStatus::EVALUATING])) {
            throw new ProcurementDomainException(
                "Action Denied: You cannot declare a failure for a project that is currently in the '{$procurement->status->label()}' phase."
            );
        }

        $updateData = [
            'failure_reasons' => $dto->reason,
            'failed_date' => $dto->failedDate, // e.g., "2026-04-15"

            // If it was evaluating, nullify the winning_bidder just to ensure the database stays perfectly clean.
            'winning_bidder_name' => null,
            'contract_amount' => null,
            'awarded_date' => null,
        ];

        $this->procurementsRepo->update($dto->municipalId, $dto->procurementId, $updateData);

        $this->procurementsRepo->transitionStatus(
            $dto->procurementId,
            ProcurementStatus::FAILED
        );
    }
}