<?php

namespace App\External\Web\Controllers\Facility\Admin;

use App\Core\Facility\Actions\GetFacilitiesAction;
use App\Core\Facility\Enums\FacilityType;
use App\External\Api\Request\Facility\IndexFacilityRequest;
use App\External\Api\Resources\Facility\AdminFacilityListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexFacilityController extends Controller
{
    public function __construct(
        private GetFacilitiesAction $action,
    ) {}

    public function __invoke(IndexFacilityRequest $request): Response
    {
        return Inertia::render('Facility/Admin/Index', [
            'facilities' => AdminFacilityListResource::collection($this->action->execute(app('municipal_id'), $request->validated())),
            'filters' => $request->safe()->only(['search', 'type', 'publication']), 'types' => FacilityType::toOptions(),
        ]);
    }
}
