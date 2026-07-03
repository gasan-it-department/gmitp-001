<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports\Exports;

use App\Core\Cemetery\Actions\Reports\ListLeaseExpiryReportAction;
use App\Core\Cemetery\Dto\Reports\LeaseReportFiltersDto;
use App\External\Api\Request\Cemetery\Reports\LeaseReportRequest;
use App\External\Documents\Cemetery\Reports\CemeteryReportExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportLeaseReportController extends Controller
{
    public function __construct(private ListLeaseExpiryReportAction $report) {}

    public function __invoke(LeaseReportRequest $request): BinaryFileResponse
    {
        $filters = LeaseReportFiltersDto::fromArray($request->filters());

        return Excel::download(
            new CemeteryReportExport(
                $this->report->headings(),
                $this->report->exportRows(app('municipal_id'), $filters),
            ),
            'cemetery-lease-report-'.now()->format('Ymd-His').'.xlsx',
        );
    }
}
