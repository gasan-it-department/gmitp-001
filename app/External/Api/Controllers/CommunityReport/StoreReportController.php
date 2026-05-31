<?php

namespace App\External\Api\Controllers\CommunityReport;

use App\Core\CommunityReport\Actions\SubmitReportAction;
use App\Core\CommunityReport\Dto\SubmitReportDto;
use App\External\Api\Request\CommunityReport\SubmitReportRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreReportController extends Controller
{
    public function __construct(
        private SubmitReportAction $submitReport,
    ) {
    }

    public function __invoke(SubmitReportRequest $request): RedirectResponse
    {
        $this->submitReport->execute(
            SubmitReportDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Report submitted successfully.');
    }
}
