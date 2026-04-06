<?php

namespace App\External\Api\Controllers\Procurement\Document;

use App\Core\Procurement\Dto\ProcurementDocumentDto;
use App\Core\Procurement\UseCases\Document\StoreProcurementDocumentUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreProcurementDocumentController extends Controller
{

    public function __construct(
        private StoreProcurementDocumentUseCase $storeProcurementDoc,
    ) {
    }
    public function __invoke(Request $request, string $procurementId)
    {
        $maxBytes = config('procurement.documents.max_size_bytes');
        $validated = $request->validate([
            'file_path' => ['required', 'string'],
            'type' => ['required', 'string'],
            'file_name' => ['required', 'string'],
            'file_size' => ['required', 'integer', "max:{$maxBytes}"],
            'mime_type' => ['required', 'string'],
        ]);

        $actualSizeInCloud = Storage::disk('s3')->size($validated['file_path']);

        if ($actualSizeInCloud > $maxBytes) {
            Storage::disk('s3')->delete($validated['file_path']);
            abort(422, 'The uploaded file exceeds the 10MB limit and has been deleted.');
        }

        $dto = ProcurementDocumentDto::fromRequest($validated, $procurementId);

        $document = $this->storeProcurementDoc->execute($dto);

        return response()->json([
            'success' => true,
            'message' => 'Uploaded Successfully',
            'document' => $document,
        ], 201);
    }

}