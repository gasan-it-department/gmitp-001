<?php

namespace App\External\Api\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\AcknowledgeReportAction;
use App\Core\CommunityReport\Dto\AcknowledgeReportDto;
use App\External\Api\Request\CommunityReport\Admin\AcknowledgeReportRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class AcknowledgeReportController extends Controller
{
    public function __construct(
        private AcknowledgeReportAction $acknowledgeReport,
    ) {
    }

    public function __invoke(AcknowledgeReportRequest $request, string $reportId): RedirectResponse
    {
        $this->acknowledgeReport->execute(
            new AcknowledgeReportDto(
                municipalId: app('municipal_id'),
                reportId: $reportId,
                actorUserId: $request->user()->id,
                acknowledgementNote: $request->string('acknowledgement_note')->toString(),
            )
        );

        return back()->with('success', 'Report acknowledged.');
    }
}
