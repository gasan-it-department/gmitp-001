<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Http\Controllers\Controller;
use App\Core\ActionCenter\Applications\Services\StatusList;
use App\Core\ActionCenter\Applications\Services\UpdateAssistanceStatus;
use App\Core\ActionCenter\Applications\Dto\UpdateStatusDto;
use Illuminate\Http\Request;
class ActionCenterStatusController extends Controller
{

    public function __construct(
        protected UpdateAssistanceStatus $updateStatus,
    ) {
    }

    public function getStatusList(StatusList $statusService)
    {
        return response()->json([
            'success' => true,
            'data' => $statusService->statusList()
        ], 200);
    }

    public function updateAssistanceStatus(Request $request, string $assistanceId)
    {
        $validated = $request->validate([
            'status' => ['required', 'string']

        ]);

        $userId = request()->user()->id;

        $dto = new UpdateStatusDto(
            $assistanceId,
            $validated['status'],
            $userId
        );

        $this->updateStatus->execute($dto);

        return response()->json(['message' => 'status updated'], 200);
    }
}