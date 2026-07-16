<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use App\Core\ActionCenter\UseCase\Assistance\Client\ShowClientAssistanceRequestAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceRequestDetailsResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowClientAssistanceRequestController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        string $municipality,
        Request $request,
        string $assistanceRequestId,
        ShowClientAssistanceRequestAction $action
    ): Response {
        $userId = $request->user()->id;

        $assistanceRequest = $action->execute($userId, $assistanceRequestId, app('municipal_id'));

        return Inertia::render('ActionCenter/Client/Details/AssistanceDetails', [
            'request' => new AssistanceRequestDetailsResource($assistanceRequest),
        ]);
    }
}
