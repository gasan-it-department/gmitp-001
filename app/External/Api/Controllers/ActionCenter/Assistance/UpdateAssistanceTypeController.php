<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceTypeDto;
use App\Core\ActionCenter\UseCase\Assistance\UpdateAssistanceTypeAction;
use App\External\Api\Request\ActionCenter\UpdateAssistanceTypeRequest;
use App\Http\Controllers\Controller;

class UpdateAssistanceTypeController extends Controller
{
    public function __construct(
        private UpdateAssistanceTypeAction $updateAction,
    ) {
    }
    public function __invoke(UpdateAssistanceTypeRequest $request, string $typeId)
    {
        $municipality = app('current_municipality');
        $dto = UpdateAssistanceTypeDto::fromRequest($request);

        $this->updateAction->execute($dto, $typeId);

        return redirect()
            ->route('actionCenter.admin.list.assistance.types', ['municipality' => $municipality->slug])
            ->with('success', 'Assistance Type updated successfully.');

    }
}