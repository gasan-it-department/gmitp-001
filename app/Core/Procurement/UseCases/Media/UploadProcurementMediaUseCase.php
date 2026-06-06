<?php

namespace App\Core\Procurement\UseCases\Media;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Models\Procurement;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Illuminate\Http\UploadedFile;

class UploadProcurementMediaUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo
    ) {
    }

    /**
     * @param string $procurementId
     * @param string $municipalId
     * @param UploadedFile $file
     * @param ProcurementDocumentType $type
     * @throws ProcurementDomainException
     */
    public function execute(string $procurementId, string $municipalId, UploadedFile $file, ProcurementDocumentType $type): void
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $municipalId);

        if (!$procurement) {
            throw new ProcurementDomainException("Procurement record not found.");
        }

        // Validate if the current status allows this document type (Compliance check)
        if (!in_array($procurement->status, $type->allowedStatuses())) {
            throw new ProcurementDomainException(
                sprintf(
                    "Action Denied: The document type '%s' is not allowed when the project is in the '%s' status.",
                    $type->label(),
                    $procurement->status->label()
                )
            );
        }

        // Attach the file to the corresponding Spatie Media Collection
        $procurement->addMedia($file)
            ->toMediaCollection($type->value);
    }
}
