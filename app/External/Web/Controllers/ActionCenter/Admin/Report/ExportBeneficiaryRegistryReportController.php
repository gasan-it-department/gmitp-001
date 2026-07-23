<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Report;

use App\Core\ActionCenter\Dto\Report\BeneficiaryRegistryReportFiltersDto;
use App\Core\ActionCenter\UseCase\Report\ListBeneficiaryRegistryReportAction;
use App\External\Api\Request\ActionCenter\Report\BeneficiaryRegistryReportRequest;
use App\External\Documents\ActionCenter\Excel\ActionCenterReportExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportBeneficiaryRegistryReportController extends Controller
{
    public function __construct(private readonly ListBeneficiaryRegistryReportAction $report) {}

    public function __invoke(BeneficiaryRegistryReportRequest $request): BinaryFileResponse
    {
        $municipality = app('current_municipality');
        $filters = BeneficiaryRegistryReportFiltersDto::fromArray($request->filters());

        return Excel::download(
            new ActionCenterReportExport(
                title: 'Action Center Beneficiary Registry',
                municipalityName: $municipality->name,
                generatedBy: $request->user()?->full_name ?? 'System',
                filterSummary: $this->report->filterSummary($filters),
                headings: $this->report->headings(),
                rows: $this->report->exportRows($municipality->id, $filters),
                currencyColumns: ['Q'],
            ),
            'action-center-beneficiary-registry-'.now()->format('Ymd-His').'.xlsx',
        );
    }
}
