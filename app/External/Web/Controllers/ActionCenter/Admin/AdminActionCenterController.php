<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\ActionCenter\Requests\Dto\AssistanceQueryDto;
use App\External\Api\Resources\ActionCenter\AssistanceResource;
use App\Core\ActionCenter\Requests\UseCase\GetAssistanceRequestByIdUseCase;
use App\Core\ActionCenter\Requests\UseCase\GetAssistancePerMunicipalityUseCase;

class AdminActionCenterController extends Controller
{
    public function index(Request $request, GetAssistancePerMunicipalityUseCase $assistanceUseCase)
    {
        $municipalId = app('municipal_id');

        $dto = AssistanceQueryDto::fromRequest($request);

        $assistance = $assistanceUseCase->execute($municipalId, $dto);

        return Inertia::render(
            'ActionCenter/Admin/RequestList/ActionCenterRequestList',

            [
                'requests' => AssistanceResource::collection($assistance)->response()->getData(true)
            ]
        );
    }

    public function show($id, GetAssistanceRequestByIdUseCase $getAssistanceRequestByIdUseCase)
    {

        $assistance = $getAssistanceRequestByIdUseCase->execute('01KBT8535NCCP2KEJRA3M3ZCA6');

        $assistance->load('beneficiary');

        return Inertia::render('ActionCenter/Admin/RequestDetails/AssistanceRequestsDetails', [

            'data' => (new AssistanceResource($assistance))->resolve(),

        ]);

    }
}