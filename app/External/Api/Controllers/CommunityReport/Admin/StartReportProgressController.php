<?php

namespace App\External\Api\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\StartReportProgressAction;
use App\Core\CommunityReport\Dto\StartReportProgressDto;
use App\External\Api\Request\CommunityReport\Admin\StartReportProgressRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StartReportProgressController extends Controller
{
    public function __construct(
        private StartReportProgressAction $startProgress,
    ) {
    }

    public function __invoke(StartReportProgressRequest $request, string $reportId): RedirectResponse
    {
        $this->startProgress->execute(
            new StartReportProgressDto(
                municipalId: app('municipal_id'),
                reportId: $reportId,
                actorUserId: $request->user()->id,
                assignedTo: $request->string('assigned_to')->toString(),
            )
        );

        return back()->with('success', 'Report marked as in progress.');
    }
}
