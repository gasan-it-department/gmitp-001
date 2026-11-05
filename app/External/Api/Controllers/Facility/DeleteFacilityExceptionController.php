<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\DeleteFacilityExceptionAction;
use App\Core\Facility\Dto\FacilityMutationDto;
use App\External\Api\Request\Facility\FacilityMutationRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeleteFacilityExceptionController extends Controller
{
    public function __construct(
        private DeleteFacilityExceptionAction $action,
    ) {}

    public function __invoke(FacilityMutationRequest $request, string $facility, string $exception): RedirectResponse
    {
        $this->action->execute($facility, $exception, new FacilityMutationDto(app('municipal_id'), $request->integer('revision')));

        return back()->with('success', 'Facility updated.');
    }
}
