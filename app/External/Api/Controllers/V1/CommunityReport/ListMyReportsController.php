<?php

namespace App\External\Api\Controllers\V1\CommunityReport;

use App\Core\CommunityReport\Actions\ListMyReportSubmissionAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ListMyReportsController extends Controller
{
    public function __construct(
        private ListMyReportSubmissionAction $listMyReportSubmission,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        return response()->json(
            $this->listMyReportSubmission->execute(),
        );
    }
}
