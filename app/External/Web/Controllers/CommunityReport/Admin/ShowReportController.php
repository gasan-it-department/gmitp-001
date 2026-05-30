<?php

namespace App\External\Web\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\GetAdminReportSubmissionDetailsAction;
use App\External\Api\Resources\ReportSubmission\AdminReportDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowReportController extends Controller
{
    public function __construct(
        private GetAdminReportSubmissionDetailsAction $getReportDetails,
    ) {
    }

    /**
     * $municipal is the URL slug — already validated by municipalityContext
     * middleware which set app('municipal_id'). We ignore it here and rely
     * on the canonical tenant id.
     */
    public function __invoke(string $municipal, string $report_submission): Response
    {
        $report = $this->getReportDetails->execute(
            municipalId: app('municipal_id'),
            reportId: $report_submission,
        );

        return Inertia::render('CitizenReport/Admin/Details/ReportDetails', [
            'report' => (new AdminReportDetailsResource($report))->resolve(),
        ]);
    }
}
