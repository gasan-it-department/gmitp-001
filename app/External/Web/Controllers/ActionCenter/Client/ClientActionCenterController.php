<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use App\Core\ActionCenter\UseCase\Assistance\GetUserAssistanceRequestAction;
use App\External\Api\Resources\ActionCenter\AssistanceResource;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ClientActionCenterController extends Controller
{
    public function index(Request $request, GetUserAssistanceRequestAction $getUserAssistanceRequestsUseCase)
    {

        $userId = auth()->user()->id;

        $assistance = $getUserAssistanceRequestsUseCase->execute($userId);

        return Inertia::render('ActionCenter/Client/List/Assistance', [

            'assistance' => AssistanceResource::collection($assistance)

        ]);

    }

}