<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Report;

use App\Core\ActionCenter\Dto\Report\AssistanceRequestReportFiltersDto;
use App\Core\ActionCenter\UseCase\Report\ListAssistanceRequestReportAction;
use App\External\Api\Request\ActionCenter\Report\AssistanceRequestReportRequest;
use App\External\Documents\ActionCenter\Excel\ActionCenterReportExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportAssistanceRequestReportController extends Controller
{
    public function __construct(private readonly ListAssistanceRequestReportAction $report) {}

    public function __invoke(AssistanceRequestReportRequest $request): BinaryFileResponse
    {
        $municipalId = app('municipal_id');
        $municipality = app('current_municipality');
        $filters = AssistanceRequestReportFiltersDto::fromArray($request->filters());

        return Excel::download(
            new ActionCenterReportExport(
                title: 'Action Center Assistance Request Register',
                municipalityName: $municipality->name,
                generatedBy: $request->user()?->full_name ?? 'System',
                filterSummary: $this->report->filterSummary($municipalId, $filters),
                headings: $this->report->headings(),
                rows: $this->report->exportRows($municipalId, $filters),
                currencyColumns: ['J'],
            ),
            'action-center-assistance-requests-'.now()->format('Ymd-His').'.xlsx',
        );
    }
}
