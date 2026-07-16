<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports\Exports;

use App\Core\Cemetery\Actions\Reports\ListIntermentLifecycleReportAction;
use App\Core\Cemetery\Dto\Reports\IntermentLifecycleReportFiltersDto;
use App\External\Api\Request\Cemetery\Reports\IntermentLifecycleReportRequest;
use App\External\Documents\Cemetery\Reports\CemeteryReportExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportIntermentLifecycleReportController extends Controller
{
    public function __construct(private ListIntermentLifecycleReportAction $report) {}

    public function __invoke(IntermentLifecycleReportRequest $request): BinaryFileResponse
    {
        $filters = IntermentLifecycleReportFiltersDto::fromArray($request->filters());

        return Excel::download(
            new CemeteryReportExport(
                $this->report->headings(),
                $this->report->exportRows(app('municipal_id'), $filters),
            ),
            'cemetery-interment-lifecycle-report-'.now()->format('Ymd-His').'.xlsx',
        );
    }
}
