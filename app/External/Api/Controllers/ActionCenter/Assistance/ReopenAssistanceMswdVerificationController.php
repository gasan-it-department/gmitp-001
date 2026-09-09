<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceMswdReasonDto;
use App\Core\ActionCenter\UseCase\Assistance\ReopenAssistanceMswdVerificationAction;
use App\External\Api\Request\ActionCenter\ReopenAssistanceMswdVerificationRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReopenAssistanceMswdVerificationController extends Controller
{
    public function __construct(private readonly ReopenAssistanceMswdVerificationAction $reopenVerification) {}

    public function __invoke(string $assistanceRequestId, ReopenAssistanceMswdVerificationRequest $request): JsonResponse
    {
        try {
            $this->reopenVerification->execute(new AssistanceMswdReasonDto(
                $assistanceRequestId,
                app('municipal_id'),
                (string) $request->user()->id,
                $request->validated('reason'),
            ));

            return response()->json(['message' => 'MSWD verification was reopened.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['reason' => $exception->getMessage()]], 422);
        }
    }
}
