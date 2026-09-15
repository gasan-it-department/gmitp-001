<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\GetAssistanceCooldownContextAction;
use App\External\Api\Request\ActionCenter\GetAssistanceCooldownContextRequest;
use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

final class GetAssistanceCooldownContextController extends Controller
{
    public function __construct(
        private readonly GetAssistanceCooldownContextAction $getContext,
    ) {}

    public function __invoke(
        GetAssistanceCooldownContextRequest $request,
        string $assistanceRequestId,
    ): JsonResponse {
        try {
            return response()->json($this->getContext->execute(
                $assistanceRequestId,
                app('municipal_id'),
                CarbonImmutable::parse((string) $request->validated('release_date'))->startOfDay(),
            ));
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }
}
