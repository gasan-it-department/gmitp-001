<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Requests\UseCase\GetAssistanceRequestByIdUseCase;
use App\External\Api\Resources\ActionCenter\AssistanceResource;
use App\Http\Controllers\Controller;
use inertia\Inertia;

class AdminActionCenterController extends Controller
{
    public function index()
    {
        return Inertia::render('ActionCenter/Admin/RequestList/ActionCenterRequestList');
    }

    public function show($id, GetAssistanceRequestByIdUseCase $getAssistanceRequestByIdUseCase)
    {

        $assistance = $getAssistanceRequestByIdUseCase->execute('01KBHAZ24CCZR13PW6G08PYX1T');
        $assistance->load('beneficiary');
        return Inertia::render('ActionCenter/Admin/RequestDetails/AssistanceRequestsDetails', [

            'data' => (new AssistanceResource($assistance))->resolve(),

        ]);

    }
}