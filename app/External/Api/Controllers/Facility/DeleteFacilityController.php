<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\DeleteFacilityAction;
use App\Core\Facility\Dto\FacilityMutationDto;
use App\External\Api\Request\Facility\DeleteFacilityRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeleteFacilityController extends Controller
{
    public function __construct(
        private DeleteFacilityAction $action,
    ) {}

    public function __invoke(DeleteFacilityRequest $request, string $facility): RedirectResponse
    {
        $this->action->execute($facility, new FacilityMutationDto(app('municipal_id'), $request->integer('revision')));

        return redirect()->route('facility.admin.index', ['municipality' => app('current_municipality')->slug])->with('success', 'Facility deleted.');
    }
}
