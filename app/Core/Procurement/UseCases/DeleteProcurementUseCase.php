<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;

class DeleteProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo,
    ) {
    }

    public function execute(string $municipalId, string $procurementId): void
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $municipalId);

        if (!$procurement) {
            throw new ProcurementDomainException("Procurement project not found.");
        }

        if ($procurement->status !== ProcurementStatus::DRAFT) {
            throw new ProcurementDomainException(
                "Action Denied: You can only delete procurements that are in the Draft stage."
            );
        }

        $this->procurementsRepo->deleteProcurement($procurementId);

    }
}