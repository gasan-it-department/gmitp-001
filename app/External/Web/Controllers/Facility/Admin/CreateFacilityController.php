<?php

namespace App\External\Web\Controllers\Facility\Admin;

use App\Core\Facility\Actions\GetFacilityAddressOptionsAction;
use App\Core\Facility\Enums\FacilityType;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateFacilityController extends Controller
{
    public function __construct(
        private GetFacilityAddressOptionsAction $addresses,
    ) {}

    public function __invoke(): Response
    {
        return Inertia::render('Facility/Admin/Form', ['facility' => null, 'types' => FacilityType::toOptions(), 'statuses' => [], 'notice_types' => [],
            'address_barangays' => $this->addresses->execute(app('municipal_id'))]);
    }
}
