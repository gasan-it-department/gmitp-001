<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CompleteAssistanceMswdVerificationDto;
use App\Core\ActionCenter\UseCase\Assistance\CompleteAssistanceMswdVerificationAction;
use App\External\Api\Request\ActionCenter\CompleteAssistanceMswdVerificationRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CompleteAssistanceMswdVerificationController extends Controller
{
    public function __construct(private readonly CompleteAssistanceMswdVerificationAction $completeVerification) {}

    public function __invoke(string $assistanceRequestId, CompleteAssistanceMswdVerificationRequest $request): JsonResponse
    {
        try {
            $this->completeVerification->execute(CompleteAssistanceMswdVerificationDto::fromRequest(
                $request,
                $assistanceRequestId,
                app('municipal_id'),
                (string) $request->user()->id,
            ));

            return response()->json(['message' => 'MSWD verification is complete.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['verification' => $exception->getMessage()]], 422);
        }
    }
}
