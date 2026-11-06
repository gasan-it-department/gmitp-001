<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\StoreFacilityExceptionAction;
use App\Core\Facility\Dto\StoreFacilityExceptionDto;
use App\Core\Facility\Services\FacilityNotificationService;
use App\External\Api\Request\Facility\StoreFacilityExceptionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreFacilityExceptionController extends Controller
{
    public function __construct(
        private StoreFacilityExceptionAction $storeException,
        private FacilityNotificationService $notifications,
    ) {}

    public function __invoke(StoreFacilityExceptionRequest $request, string $facility): RedirectResponse
    {
        $saved = $this->storeException->execute($facility, StoreFacilityExceptionDto::fromRequest($request, app('municipal_id')));

        return back()->with('success', $this->notifications->feedback($saved, 'Schedule exception added.'));
    }
}
