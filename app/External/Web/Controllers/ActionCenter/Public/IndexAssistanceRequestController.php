<?php

namespace App\External\Web\Controllers\ActionCenter\Public;

use App\Core\ActionCenter\UseCase\Assistance\ListActiveAssistanceTypeAction;
use App\External\Api\Resources\ActionCenter\AssistanceTypeListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class IndexAssistanceRequestController extends Controller
{
    public function __construct(
        private ListActiveAssistanceTypeAction $listAssistanceTypes
    ) {
    }

    public function __invoke()
    {
        $assistanceTypes = $this->listAssistanceTypes->execute(app('municipal_id'));

        return Inertia::render('ActionCenter/Public/ActionCenterPortal', [
            'assistanceTypes' => AssistanceTypeListResource::collection($assistanceTypes),
        ]);
    }
}