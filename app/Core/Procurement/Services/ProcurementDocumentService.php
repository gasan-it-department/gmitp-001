<?php

namespace App\Core\Procurement\Services;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Exceptions\ProcurementDocumentException;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Models\Procurement;
use App\Core\Procurement\Repositories\ProcurementsRepository;

class ProcurementDocumentService
{
    public function __construct(
        protected ProcurementsRepository $procurementsRepo,

    ) {
    }
    private const MAX_LIMIT = 15;

    public function isWithinLimit(int $count): bool
    {
        return $count < self::MAX_LIMIT;
    }

    public function validateUploadRules(string $municipalId, string $procurementId, ProcurementDocumentType $type): Procurement
    {
        // 1. Fetch the project
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $municipalId);

        if (!$procurement) {
            throw new ProcurementDomainException("Procurement not found.");
        }

        // 2. Validate the rule using the $type passed into the method
        if (!in_array($procurement->status, $type->allowedStatuses())) {
            throw ProcurementDocumentException::invalidTypeForStatus(
                $type->label(),
                $procurement->status->value
            );
        }

        // 3. Return the verified procurement so the caller can use it!
        return $procurement;
    }

}