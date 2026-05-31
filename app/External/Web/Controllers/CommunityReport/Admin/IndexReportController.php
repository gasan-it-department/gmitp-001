<?php

namespace App\External\Web\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\GetAdminReportSubmissionsAction;
use App\External\Api\Resources\ReportSubmission\AdminReportListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexReportController extends Controller
{
    public function __construct(
        private GetAdminReportSubmissionsAction $listReports,
    ) {
    }

    public function __invoke(): Response
    {
        $reports = $this->listReports->execute(
            municipalId: app('municipal_id'),
            perPage: 20,
        );

        return Inertia::render('CitizenReport/Admin/List/CommunityReportsPage', [
            'reports' => AdminReportListResource::collection($reports),
        ]);
    }
}
