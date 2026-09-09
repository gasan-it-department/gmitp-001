<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReassignAssistanceMswdReviewerDto;
use App\Core\ActionCenter\UseCase\Assistance\ReassignAssistanceMswdReviewerAction;
use App\External\Api\Request\ActionCenter\ReassignAssistanceMswdReviewerRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReassignAssistanceMswdReviewerController extends Controller
{
    public function __construct(private readonly ReassignAssistanceMswdReviewerAction $reassignReviewer) {}

    public function __invoke(string $assistanceRequestId, ReassignAssistanceMswdReviewerRequest $request): JsonResponse
    {
        try {
            $this->reassignReviewer->execute(ReassignAssistanceMswdReviewerDto::fromRequest(
                $request,
                $assistanceRequestId,
                app('municipal_id'),
                (string) $request->user()->id,
            ));

            return response()->json(['message' => 'The MSWD reviewer was reassigned.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['reason' => $exception->getMessage()]], 422);
        }
    }
}
