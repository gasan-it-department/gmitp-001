<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\UpdateFacilityExceptionAction;
use App\Core\Facility\Dto\UpdateFacilityExceptionDto;
use App\Core\Facility\Services\FacilityNotificationService;
use App\External\Api\Request\Facility\UpdateFacilityExceptionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateFacilityExceptionController extends Controller
{
    public function __construct(
        private UpdateFacilityExceptionAction $updateException,
        private FacilityNotificationService $notifications,
    ) {}

    public function __invoke(UpdateFacilityExceptionRequest $request, string $facility, string $exception): RedirectResponse
    {
        $saved = $this->updateException->execute($facility, $exception, UpdateFacilityExceptionDto::fromRequest($request, app('municipal_id')));

        return back()->with('success', $this->notifications->feedback($saved, 'Schedule exception updated.'));
    }
}
