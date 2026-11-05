<?php

namespace App\External\Web\Controllers\Facility\Admin;

use App\Core\Facility\Actions\GetFacilityAddressOptionsAction;
use App\Core\Facility\Actions\GetFacilityDetailsAction;
use App\Core\Facility\Enums\FacilityType;
use App\Core\Facility\Enums\FacilityOperatingStatus;
use App\Core\Facility\Enums\FacilityNoticeType;
use App\External\Api\Resources\Facility\AdminFacilityDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EditFacilityController extends Controller
{
    public function __construct(
        private GetFacilityDetailsAction $action,
        private GetFacilityAddressOptionsAction $addresses,
    ) {}

    public function __invoke(string $municipality, string $facility): Response
    {
        return Inertia::render('Facility/Admin/Form', [
            'facility' => (new AdminFacilityDetailsResource($this->action->execute(app('municipal_id'), $facility)))->resolve(),
            'types' => FacilityType::toOptions(), 'statuses' => FacilityOperatingStatus::toOptions(), 'notice_types' => FacilityNoticeType::toOptions(),
            'address_barangays' => $this->addresses->execute(app('municipal_id')),
        ]);
    }
}
