<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\UpdateProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;

class UpdateProcurementUseCase
{
    public function __construct(
        protected ProcurementsRepository $procurementsRepo,
    ) {
    }

    public function execute(UpdateProcurementDto $dto, string $procurementId)
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $dto->municipalId);

        if (!$procurement || $procurement->status !== ProcurementStatus::DRAFT) {
            throw new ProcurementDomainException("Action Denied: Invalid state or record.");
        }

        $this->procurementsRepo->update($dto, $procurementId);

    }
}