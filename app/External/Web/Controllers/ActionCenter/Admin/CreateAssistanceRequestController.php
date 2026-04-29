<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\UseCase\Assistance\ListAssistanceTypesAction;
use App\External\Api\Resources\ActionCenter\AssistanceTypesResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CreateAssistanceRequestController extends Controller
{
    public function __construct(
        private ListAssistanceTypesAction $listAssistanceTypesAction
    ) {
    }

    public function __invoke()
    {

        $assistanceType = $this->listAssistanceTypesAction->execute(app('municipal_id'));

        return Inertia::render('ActionCenter/Admin/Assistance/Create/CreateAssistance', [
            'assistanceType' => AssistanceTypesResource::collection($assistanceType),
        ]);
    }
}