<?php

namespace App\External\Api\Controllers\Procurement\Document;


use App\Core\Procurement\UseCases\Document\GenerateDocumentUploadUrlUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenerateProcurementDocumentController extends Controller
{
    public function __construct(
        private GenerateDocumentUploadUrlUseCase $generateDocumentUploadUrlUseCase,
    ) {
    }

    public function __invoke(Request $request, string $procurementId): JsonResponse
    {
        $maxBytes = config('procurement.documents.max_size_bytes');
        // 1. Strict Validation
        $validated = $request->validate([
            'extension' => ['required', 'string', 'in:pdf'],
            'content_type' => ['required', 'string', 'in:application/pdf'],
            'file_size' => ['required', 'integer', "max:{$maxBytes}"],
        ]);

        $result = $this->generateDocumentUploadUrlUseCase->execute(
            app('municipal_id'),
            $procurementId,
            $validated['extension'],
            $validated['content_type'],
        );

        return response()->json($result);
    }
}