<?php

namespace App\Core\Procurement\UseCases\Media;

use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Illuminate\Support\Facades\DB;

class DeleteProcurementMediaUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo,
    ) {}

    public function execute(string $procurementId, string $municipalId, string $mediaId): void
    {
        DB::transaction(function () use ($procurementId, $municipalId, $mediaId) {
            $procurement = $this->procurementsRepo->lockByIdAndMunicipality($procurementId, $municipalId);

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('Documents attached to a published procurement cannot be deleted.');
            }

            $media = $procurement->media()->lockForUpdate()->find($mediaId);
            if (! $media) {
                throw new ProcurementDomainException('Media record not found or does not belong to this procurement.');
            }

            $media->delete();
        }, attempts: 3);
    }
}
