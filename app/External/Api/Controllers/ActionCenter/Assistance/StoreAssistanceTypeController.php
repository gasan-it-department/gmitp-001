<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceTypeDto;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceTypeAction;
use App\External\Api\Request\ActionCenter\StoreAssistanceTypeRequest;
use App\Http\Controllers\Controller;

class StoreAssistanceTypeController extends Controller
{
    public function __construct(
        private StoreAssistanceTypeAction $storeAssistanceTypeAction
    ) {
    }

    public function __invoke(StoreAssistanceTypeRequest $request)
    {
        $municipality = app('current_municipality');
        $dto = StoreAssistanceTypeDto::fromRequest($request);
        $this->storeAssistanceTypeAction->execute($dto, $municipality->id);

        // 4. The Response: Send them back to the table view
        return redirect()
            ->route('actionCenter.admin.list.assistance.types', ['municipality' => $municipality->slug])
            ->with('success', 'Assistance Type created successfully.');
    }
}