<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\SetFacilityOperatingStatusAction;
use App\Core\Facility\Dto\FacilityOperatingStatusDto;
use App\Core\Facility\Enums\FacilityOperatingStatus;
use App\Core\Facility\Services\FacilityNotificationService;
use App\External\Api\Request\Facility\SetFacilityOperatingStatusRequest;
use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;

class SetFacilityOperatingStatusController extends Controller
{
    public function __construct(
        private SetFacilityOperatingStatusAction $action,
        private FacilityNotificationService $notifications,
    ) {}

    public function __invoke(SetFacilityOperatingStatusRequest $request, string $facility): RedirectResponse
    {
        $saved = $this->action->execute($facility, new FacilityOperatingStatusDto(
            app('municipal_id'), $request->integer('revision'), FacilityOperatingStatus::from($request->validated('operating_status')),
            $request->validated('operating_notice'), $request->filled('expected_reopens_at')
                ? CarbonImmutable::parse($request->validated('expected_reopens_at'), 'Asia/Manila') : null,
            $request->validated('today_exception'),
            $request->boolean('notify_mobile'),
        ));

        return back()->with('success', $this->notifications->feedback($saved, 'Facility updated.'));
    }
}
