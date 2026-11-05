<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\UpdateFacilityExceptionAction;
use App\Core\Facility\Dto\UpdateFacilityExceptionDto;
use App\External\Api\Request\Facility\UpdateFacilityExceptionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateFacilityExceptionController extends Controller
{
    public function __construct(
        private UpdateFacilityExceptionAction $updateException,
    ) {}

    public function __invoke(UpdateFacilityExceptionRequest $request, string $facility, string $exception): RedirectResponse
    {
        $this->updateException->execute($facility, $exception, UpdateFacilityExceptionDto::fromRequest($request, app('municipal_id')));

        return back()->with('success', 'Schedule exception updated.');
    }
}
