<?php

namespace App\External\Api\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\ArchiveReportAction;
use App\Core\CommunityReport\Dto\ArchiveReportDto;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ArchiveReportController extends Controller
{
    public function __construct(
        private ArchiveReportAction $archiveReport,
    ) {}

    public function __invoke(Request $request, string $reportId): RedirectResponse
    {
        $this->archiveReport->execute(
            new ArchiveReportDto(
                municipalId: app('municipal_id'),
                reportId: $reportId,
                actorUserId: $request->user()->id,
            )
        );

        return redirect()
            ->route('communityReport.admin.index', [
                'municipality' => app('current_municipality')->slug,
            ])
            ->with('success', 'Report archived.');
    }
}
