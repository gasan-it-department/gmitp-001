<?php

namespace App\External\Web\Controllers\CommunityReport\Admin;

use App\Core\CommunityReport\Actions\GetAdminReportSubmissionsAction;
use App\Core\CommunityReport\Dto\AdminReportFiltersDto;
use App\Core\CommunityReport\Enums\ReportCategory;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\External\Api\Request\CommunityReport\Admin\IndexReportRequest;
use App\External\Api\Resources\ReportSubmission\AdminReportListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexReportController extends Controller
{
    public function __construct(
        private GetAdminReportSubmissionsAction $listReports,
    ) {}

    public function __invoke(IndexReportRequest $request): Response
    {
        $filters = AdminReportFiltersDto::fromArray($request->filters());
        $reports = $this->listReports->execute(
            municipalId: app('municipal_id'),
            filters: $filters,
        );

        return Inertia::render('CitizenReport/Admin/List/CommunityReportsPage', [
            'reports' => AdminReportListResource::collection($reports),
            'filters' => $filters->toArray(),
            'status_options' => ReportStatus::toOptions(),
            'category_options' => ReportCategory::toOptions(),
            'visibility_options' => [
                ['value' => AdminReportFiltersDto::VISIBILITY_ANONYMOUS, 'label' => 'Anonymous'],
                ['value' => AdminReportFiltersDto::VISIBILITY_IDENTIFIED, 'label' => 'Identified'],
            ],
            'sort_options' => [
                ['value' => AdminReportFiltersDto::SORT_NEWEST, 'label' => 'Newest first'],
                ['value' => AdminReportFiltersDto::SORT_OLDEST, 'label' => 'Oldest first'],
            ],
            'archive_status_options' => [
                ['value' => AdminReportFiltersDto::ARCHIVE_ACTIVE, 'label' => 'Active'],
                ['value' => AdminReportFiltersDto::ARCHIVE_ARCHIVED, 'label' => 'Archived'],
                ['value' => AdminReportFiltersDto::ARCHIVE_ALL, 'label' => 'All'],
            ],
            'per_page_options' => AdminReportFiltersDto::PER_PAGE_OPTIONS,
        ]);
    }
}
