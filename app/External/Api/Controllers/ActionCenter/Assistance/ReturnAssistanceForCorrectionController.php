<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceMswdReasonDto;
use App\Core\ActionCenter\UseCase\Assistance\ReturnAssistanceForCorrectionAction;
use App\External\Api\Request\ActionCenter\ReturnAssistanceForCorrectionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReturnAssistanceForCorrectionController extends Controller
{
    public function __construct(private readonly ReturnAssistanceForCorrectionAction $returnForCorrection) {}

    public function __invoke(string $assistanceRequestId, ReturnAssistanceForCorrectionRequest $request): JsonResponse
    {
        try {
            $this->returnForCorrection->execute(new AssistanceMswdReasonDto(
                $assistanceRequestId,
                app('municipal_id'),
                (string) $request->user()->id,
                $request->validated('reason'),
            ));

            return response()->json(['message' => 'The request was returned for correction.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['reason' => $exception->getMessage()]], 422);
        }
    }
}
