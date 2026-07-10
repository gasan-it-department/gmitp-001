<?php

namespace App\External\Api\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\RestoreReportAction;
use App\Core\CommunityReport\Dto\RestoreReportDto;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RestoreReportController extends Controller
{
    public function __construct(
        private RestoreReportAction $restoreReport,
    ) {}

    public function __invoke(Request $request, string $reportId): RedirectResponse
    {
        $this->restoreReport->execute(
            new RestoreReportDto(
                municipalId: app('municipal_id'),
                reportId: $reportId,
                actorUserId: $request->user()->id,
            )
        );

        return back()->with('success', 'Report restored.');
    }
}
