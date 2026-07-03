<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports\Exports;

use App\Core\Cemetery\Actions\Reports\ListPlotInventoryReportAction;
use App\Core\Cemetery\Dto\Reports\PlotInventoryReportFiltersDto;
use App\External\Api\Request\Cemetery\Reports\PlotInventoryReportRequest;
use App\External\Documents\Cemetery\Reports\CemeteryReportExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportPlotInventoryReportController extends Controller
{
    public function __construct(private ListPlotInventoryReportAction $report) {}

    public function __invoke(PlotInventoryReportRequest $request): BinaryFileResponse
    {
        $filters = PlotInventoryReportFiltersDto::fromArray($request->filters());

        return Excel::download(
            new CemeteryReportExport(
                $this->report->headings(),
                $this->report->exportRows(app('municipal_id'), $filters),
            ),
            'cemetery-plot-inventory-report-'.now()->format('Ymd-His').'.xlsx',
        );
    }
}
