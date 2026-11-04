<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\FindAssistanceDisbursementReferencesAction;
use App\External\Api\Request\ActionCenter\FindAssistanceDisbursementReferencesRequest;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceDisbursementReferenceResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class FindAssistanceDisbursementReferencesController extends Controller
{
    public function __construct(private readonly FindAssistanceDisbursementReferencesAction $find) {}

    public function __invoke(FindAssistanceDisbursementReferencesRequest $request, string $assistanceRequestId): JsonResponse
    {
        $result = $this->find->execute($assistanceRequestId, app('municipal_id'), $request->validated('method'),
            $request->validated('reference'), (int) $request->validated('page', 1));

        return AssistanceDisbursementReferenceResource::collection($result['matches'])
            ->additional(['blocking' => $result['blocking']])->response();
    }
}
