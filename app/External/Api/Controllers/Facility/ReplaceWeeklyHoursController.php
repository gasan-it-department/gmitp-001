<?php

namespace App\External\Api\Controllers\Facility;

use App\Core\Facility\Actions\ReplaceWeeklyHoursAction;
use App\Core\Facility\Dto\WeeklyHoursDto;
use App\External\Api\Request\Facility\ReplaceWeeklyHoursRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ReplaceWeeklyHoursController extends Controller
{
    public function __construct(
        private ReplaceWeeklyHoursAction $action,
    ) {}

    public function __invoke(ReplaceWeeklyHoursRequest $request, string $facility): RedirectResponse
    {
        $this->action->execute($facility, new WeeklyHoursDto(app('municipal_id'), $request->integer('revision'), $request->validated('days')));

        return back()->with('success', 'Facility updated.');
    }
}
