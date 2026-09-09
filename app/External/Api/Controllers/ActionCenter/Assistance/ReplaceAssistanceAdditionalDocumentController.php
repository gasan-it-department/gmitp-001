<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReplaceAssistanceAdditionalDocumentDto;
use App\Core\ActionCenter\UseCase\Assistance\ReplaceAssistanceAdditionalDocumentAction;
use App\External\Api\Request\ActionCenter\ReplaceAssistanceAdditionalDocumentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReplaceAssistanceAdditionalDocumentController extends Controller
{
    public function __construct(private readonly ReplaceAssistanceAdditionalDocumentAction $replaceDocument) {}

    public function __invoke(
        string $assistanceRequestId,
        int $mediaId,
        ReplaceAssistanceAdditionalDocumentRequest $request,
    ): JsonResponse {
        try {
            $this->replaceDocument->execute(ReplaceAssistanceAdditionalDocumentDto::fromRequest(
                $request,
                $assistanceRequestId,
                $mediaId,
                app('municipal_id'),
                (string) $request->user()->id,
            ));

            return response()->json(['message' => 'Supporting document was replaced.']);
        } catch (\DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['document' => $exception->getMessage()],
            ], 422);
        }
    }
}
