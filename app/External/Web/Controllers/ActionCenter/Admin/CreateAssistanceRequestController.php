<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\UseCase\Assistance\ListAssistanceTypesAction;
use App\External\Api\Resources\ActionCenter\AssistanceTypesResource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
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

        $psgcMunicipalId = DB::table('psgc_municipalities')
            ->where('psgc_code', '174003000')
            ->first();
        dd($psgcMunicipalId);

        return Inertia::render('ActionCenter/Admin/Assistance/Create/CreateAssistance', [
            'assistanceTypes' => AssistanceTypesResource::collection($assistanceType),
            'sexOptions' => Sex::option(),
        ]);
    }
}