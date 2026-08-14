<?php

namespace App\External\Api\Controllers\Procurement\Media;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\UseCases\Media\UploadProcurementMediaUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UploadProcurementMediaController extends Controller
{
    public function __construct(
        private UploadProcurementMediaUseCase $uploadMediaUseCase
    ) {}

    public function __invoke(Request $request, string $procurementId): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:25600'],
            'type' => ['required', Rule::enum(ProcurementDocumentType::class)],
        ]);

        $type = ProcurementDocumentType::from($validated['type']);

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
