<?php

namespace App\External\Api\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\ResolveReportAction;
use App\Core\CommunityReport\Dto\ResolveReportDto;
use App\External\Api\Request\CommunityReport\Admin\ResolveReportRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ResolveReportController extends Controller
{
    public function __construct(
        private ResolveReportAction $resolveReport,
    ) {
    }

    public function __invoke(ResolveReportRequest $request, string $reportId): RedirectResponse
    {
        $this->resolveReport->execute(
            new ResolveReportDto(
                municipalId: app('municipal_id'),
                reportId: $reportId,
                actorUserId: $request->user()->id,
                resolutionNote: $request->string('resolution_note')->toString(),
            )
        );

        return back()->with('success', 'Report resolved.');
    }
}
