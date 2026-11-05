<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\SetFacilityPublicationAction;
use App\Core\Facility\Dto\FacilityMutationDto;
use App\External\Api\Request\Facility\SetFacilityPublicationRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class SetFacilityPublicationController extends Controller
{
    public function __construct(
        private SetFacilityPublicationAction $action,
    ) {}

    public function __invoke(SetFacilityPublicationRequest $request, string $facility): RedirectResponse
    {
        $this->action->execute($facility, new FacilityMutationDto(app('municipal_id'), $request->integer('revision')), $request->boolean('is_published'));

        return back()->with('success', 'Facility updated.');
    }
}
