<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Core\ActionCenter\Applications\Services\AssistanceTypesList;

class AssistanceTypeController extends Controller
{
    public function __construct(
        private AssistanceTypesList $assistanceTypesList
    ) {

    }
    public function assistanceTypesSelect(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->assistanceTypesList->assistanceOptionsV2()
        ], 200);
    }

}