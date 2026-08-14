<?php

namespace App\Core\Procurement\UseCases\Media;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UploadProcurementMediaUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo,
    ) {}

    public function execute(
        string $procurementId,
        string $municipalId,
        UploadedFile $file,
        ProcurementDocumentType $type,
    ): void {
        DB::transaction(function () use ($procurementId, $municipalId, $file, $type) {
            $procurement = $this->procurementsRepo->lockByIdAndMunicipality($procurementId, $municipalId);

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('Unpublish this procurement for correction before adding or replacing documents.');
            }

            $normallyAllowed = in_array($procurement->status, $type->allowedStatuses(), true);
            $basePublicDocument = $procurement->status !== ProcurementStatus::DRAFT
                && $type->isPublicBidDocument();

            if (! $normallyAllowed && ! $basePublicDocument) {
                throw new ProcurementDomainException(
                    sprintf(
                        "Action Denied: The document type '%s' is not allowed when the project is in the '%s' status.",
                        $type->label(),
                        $procurement->status->label(),
                    )
                );
            }

            $procurement->addMedia($file)
                ->toMediaCollection($type->value);
        }, attempts: 3);
    }
}
