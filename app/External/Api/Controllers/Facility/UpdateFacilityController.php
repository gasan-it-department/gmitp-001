<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\UpdateFacilityAction;
use App\Core\Facility\Dto\UpdateFacilityDto;
use App\External\Api\Request\Facility\UpdateFacilityRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateFacilityController extends Controller
{
    public function __construct(
        private UpdateFacilityAction $action,
    ) {}

    public function __invoke(UpdateFacilityRequest $request, string $facility): RedirectResponse
    {
        $this->action->execute($facility, UpdateFacilityDto::fromRequest($request, app('municipal_id')));

        return back()->with('success', 'Facility updated.');
    }
}
