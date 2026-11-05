<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\StoreFacilityAction;
use App\Core\Facility\Dto\StoreFacilityDto;
use App\External\Api\Request\Facility\StoreFacilityRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreFacilityController extends Controller
{
    public function __construct(
        private StoreFacilityAction $action,
    ) {}

    public function __invoke(StoreFacilityRequest $request): RedirectResponse
    {
        $facility = $this->action->execute(StoreFacilityDto::fromRequest($request, app('municipal_id')));

        return redirect()->route('facility.admin.edit', ['municipality' => app('current_municipality')->slug, 'facility' => $facility->id])->with('success', 'Facility created as a draft. Configure its weekly hours before publishing.');
    }
}
