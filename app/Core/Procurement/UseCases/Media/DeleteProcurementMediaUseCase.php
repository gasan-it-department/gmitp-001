<?php

namespace App\Core\Procurement\UseCases\Media;

use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DeleteProcurementMediaUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo
    ) {
    }

    public function execute(string $procurementId, string $municipalId, string $mediaId): void
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $municipalId);

        if (!$procurement) {
            throw new ProcurementDomainException("Procurement record not found.");
        }

        $media = $procurement->media()->find($mediaId);

        if (!$media) {
            throw new ProcurementDomainException("Media record not found or does not belong to this procurement.");
        }

        // Optional: Add business rules here. For example, prevent deletion if project is Awarded.
        // if ($procurement->status->value === 'awarded') {
        //     throw new ProcurementDomainException("Action Denied: You cannot delete documents from an awarded project.");
        // }

        $media->delete();
    }
}
