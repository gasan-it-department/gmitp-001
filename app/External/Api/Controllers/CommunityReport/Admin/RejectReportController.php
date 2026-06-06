<?php

namespace App\External\Api\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\RejectReportAction;
use App\Core\CommunityReport\Dto\RejectReportDto;
use App\External\Api\Request\CommunityReport\Admin\RejectReportRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class RejectReportController extends Controller
{
    public function __construct(
        private RejectReportAction $rejectReport,
    ) {
    }

    public function __invoke(RejectReportRequest $request, string $reportId): RedirectResponse
    {
        $this->rejectReport->execute(
            new RejectReportDto(
                municipalId: app('municipal_id'),
                reportId: $reportId,
                actorUserId: $request->user()->id,
                rejectionReason: $request->string('rejection_reason')->toString(),
            )
        );

        return back()->with('success', 'Report rejected.');
    }
}
