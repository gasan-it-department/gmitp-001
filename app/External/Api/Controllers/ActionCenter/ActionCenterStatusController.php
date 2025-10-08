<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Http\Controllers\Controller;
use App\Core\ActionCenter\Applications\Services\StatusList;
class ActionCenterStatusController extends Controller
{
    public function getStatusList(StatusList $statusService)
    {
        return response()->json([
            'statuses' => $statusService->statusList()
        ]);
    }
}