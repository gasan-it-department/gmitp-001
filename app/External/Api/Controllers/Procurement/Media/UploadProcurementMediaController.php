<?php

namespace App\External\Api\Controllers\Procurement\Media;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\UseCases\Media\UploadProcurementMediaUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadProcurementMediaController extends Controller
{
    public function __construct(
        private UploadProcurementMediaUseCase $uploadMediaUseCase
    ) {
    }

    public function __invoke(Request $request, string $procurementId): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:10240', // FR-2.2 (10MB Max)
            'type' => 'required|string',
        ]);

        $type = ProcurementDocumentType::from($request->type);

        $this->uploadMediaUseCase->execute(
            $procurementId,
            app('municipal_id'),
            $request->file('file'),
            $type
        );

        return response()->json([
            'message' => 'Document uploaded successfully.',
        ]);
    }
}
