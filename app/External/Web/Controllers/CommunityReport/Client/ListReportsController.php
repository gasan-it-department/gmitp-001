<?php

namespace App\External\Web\Controllers\CommunityReport\Client;

use App\Core\CommunityReport\Actions\ListMyReportSubmissionAction;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ListReportsController extends Controller
{

    public function __construct(
        protected ListMyReportSubmissionAction $listMyReportSubmissionAction
    ) {
    }

    public function __invoke(): Response
    {
        $reports = $this->listMyReportSubmissionAction->execute();

        return Inertia::render('CitizenReport/Client/List', [
            'reports' => $reports,
        ]);
    }
}
