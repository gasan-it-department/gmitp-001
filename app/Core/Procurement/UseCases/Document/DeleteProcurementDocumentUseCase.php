<?php

namespace App\Core\Procurement\UseCases\Document;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDocumentException;
use App\Core\Procurement\Repositories\ProcurementDocumentRepository;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Illuminate\Support\Facades\Storage;

class DeleteProcurementDocumentUseCase
{

    public function __construct(
        private ProcurementsRepository $procurementsRepo,
        private ProcurementDocumentRepository $procurementDocRepo,
    ) {
    }
    public function execute(string $municipalId, string $procurementId, string $documentId)
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $municipalId);

        if (!$procurement) {
            throw new ProcurementDocumentException("Procurement project not found.");
        }

        //harvey only allow the draft docs to be deleted
        if ($procurement->status !== ProcurementStatus::DRAFT) {
            throw new ProcurementDocumentException(
                "Action Denied: You cannot delete documents once the procurement is {$procurement->status}."
            );
        }

        $document = $this->procurementDocRepo->findById($documentId);

        if (!$document || $document->procurement_id !== $procurementId) {
            throw new ProcurementDocumentException("Document not found or does not belong to this project.");
        }

        Storage::disk('s3')->delete($document->file_path);

        $this->procurementDocRepo->delete($documentId);
    }

}