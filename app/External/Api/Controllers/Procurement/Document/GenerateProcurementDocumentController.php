<?php

namespace App\External\Api\Controllers\Procurement\Document;

use App\Http\Controllers\Controller;
use App\Shared\FileUploader\GeneratePresignedUrlService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
class GenerateProcurementDocumentController extends Controller
{
    public function __construct(
        private GeneratePresignedUrlService $urlService
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

        $filename = Str::ulid() . '.' . $validated['extension'];

        $storagePath = "procurements/{$procurementId}/documents/{$filename}";

        $uploadUrl = $this->urlService->execute(
            disk: 's3',
            path: $storagePath,
            contentType: $validated['content_type'],
            expirationMinutes: 15
        );

        return response()->json([
            'upload_url' => $uploadUrl['url'],
            'storage_path' => $storagePath,
        ]);
    }
}