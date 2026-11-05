<?php

namespace App\External\Web\Controllers\Facility\Client;

use App\Core\Facility\Actions\GetFacilityDetailsAction;
use App\External\Api\Resources\Facility\ClientFacilityDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowFacilityController extends Controller
{
    public function __construct(
        private GetFacilityDetailsAction $action,
    ) {}

    public function __invoke(string $municipality, string $facility): Response
    {
        return Inertia::render('Facility/Client/Show', [
            'facility' => (new ClientFacilityDetailsResource($this->action->execute(app('municipal_id'), $facility, public: true)))->resolve(),
        ]);
    }
}
