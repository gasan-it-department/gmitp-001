<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\UseCase\Assistance\ListAssistanceTypesAction;
use App\External\Api\Resources\ActionCenter\AssistanceTypeListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ListAssistanceTypeController extends Controller
{

    public function __construct(
        private ListAssistanceTypesAction $listAssistance,
    ) {
    }

    public function __invoke()
    {
        $assistanceTypes = $this->listAssistance->execute(app('municipal_id'));

        return Inertia::render('ActionCenter/Admin/Assistance/List/AssistanceTypeList', [
            'assistanceTypeList' => AssistanceTypeListResource::collection($assistanceTypes),
        ]);
    }

}