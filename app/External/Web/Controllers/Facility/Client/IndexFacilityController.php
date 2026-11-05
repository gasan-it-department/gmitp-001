<?php

namespace App\External\Web\Controllers\Facility\Client;

use App\Core\Facility\Actions\GetFacilitiesAction;
use App\Core\Facility\Enums\FacilityType;
use App\External\Api\Request\Facility\IndexFacilityRequest;
use App\External\Api\Resources\Facility\FacilityBaseResource;
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
        return Inertia::render('Facility/Client/Index', [
            'facilities' => FacilityBaseResource::collection($this->action->execute(app('municipal_id'), $request->validated(), public: true)),
            'filters' => $request->safe()->only(['search', 'type']), 'types' => FacilityType::toOptions(),
        ]);
    }
}
