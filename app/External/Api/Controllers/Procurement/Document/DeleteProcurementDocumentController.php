<?php

namespace App\External\Api\Controllers\Procurement\Document;

use App\Core\Procurement\UseCases\Document\DeleteProcurementDocumentUseCase;
use App\Http\Controllers\Controller;

class DeleteProcurementDocumentController extends Controller
{
    public function __construct(
        private DeleteProcurementDocumentUseCase $deleteProcurementDocs
    ) {
    }

    public function __invoke(string $procurementId, string $documentId)
    {
        $this->deleteProcurementDocs->execute(
            app('municipal_id'),
            $procurementId,
            $documentId
        );

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }
}