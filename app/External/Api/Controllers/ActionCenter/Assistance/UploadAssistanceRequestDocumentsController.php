<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UploadAssistanceRequestDocumentsDto;
use App\Core\ActionCenter\UseCase\Assistance\UploadAssistanceRequestDocumentsAction;
use App\External\Api\Request\ActionCenter\UploadAssistanceRequestDocumentsRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UploadAssistanceRequestDocumentsController extends Controller
{
    public function __construct(private readonly UploadAssistanceRequestDocumentsAction $uploadDocuments) {}

    public function __invoke(string $assistanceRequestId, UploadAssistanceRequestDocumentsRequest $request): JsonResponse
    {
        try {
            $this->uploadDocuments->execute(UploadAssistanceRequestDocumentsDto::fromRequest(
                $request,
                $assistanceRequestId,
                app('municipal_id'),
                (string) $request->user()->id,
            ));

            return response()->json(['message' => 'Supporting documents were uploaded.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['documents' => $exception->getMessage()]], 422);
        }
    }
}
