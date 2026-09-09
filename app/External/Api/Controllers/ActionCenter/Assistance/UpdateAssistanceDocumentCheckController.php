<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceDocumentCheckDto;
use App\Core\ActionCenter\UseCase\Assistance\UpdateAssistanceDocumentCheckAction;
use App\External\Api\Request\ActionCenter\UpdateAssistanceDocumentCheckRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UpdateAssistanceDocumentCheckController extends Controller
{
    public function __construct(private readonly UpdateAssistanceDocumentCheckAction $updateCheck) {}

    public function __invoke(string $assistanceRequestId, string $documentKey, UpdateAssistanceDocumentCheckRequest $request): JsonResponse
    {
        try {
            $this->updateCheck->execute(UpdateAssistanceDocumentCheckDto::fromRequest(
                $request,
                $assistanceRequestId,
                $documentKey,
                app('municipal_id'),
                (string) $request->user()->id,
            ));

            return response()->json(['message' => 'The MSWD document check was saved.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['document_check' => $exception->getMessage()]], 422);
        }
    }
}
