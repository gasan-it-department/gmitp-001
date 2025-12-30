<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use App\Core\ActionCenter\Requests\UseCase\GetUserAssistanceRequestsUseCase;
use App\External\Api\Resources\ActionCenter\AssistanceResource;
use inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ClientActionCenterController extends Controller
{
    public function index(Request $request, GetUserAssistanceRequestsUseCase $getUserAssistanceRequestsUseCase)
    {

        $userId = auth()->user()->id;

        $assistance = $getUserAssistanceRequestsUseCase->execute($userId);

        return Inertia::render('ActionCenter/Client/List/Assistance', [

            'assistance' => AssistanceResource::collection($assistance)

        ]);

    }

}