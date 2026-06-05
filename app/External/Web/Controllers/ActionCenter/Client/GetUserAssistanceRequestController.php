<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use App\Core\ActionCenter\UseCase\Assistance\GetUserAssistanceRequestAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequestListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GetUserAssistanceRequestController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, GetUserAssistanceRequestAction $action): Response
    {
        $userId = $request->user()->id;

        $requests = $action->execute($userId);

        return Inertia::render('ActionCenter/Client/List/AssistanceList', [
            'requests' => AssistanceRequestListResource::collection($requests),
        ]);
    }
}
