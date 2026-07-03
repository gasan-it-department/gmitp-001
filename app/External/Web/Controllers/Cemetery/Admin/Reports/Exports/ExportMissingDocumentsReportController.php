<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports\Exports;

use App\Core\Cemetery\Actions\Reports\ListMissingDocumentsReportAction;
use App\Core\Cemetery\Dto\Reports\MissingDocumentsReportFiltersDto;
use App\External\Api\Request\Cemetery\Reports\MissingDocumentsReportRequest;
use App\External\Documents\Cemetery\Reports\CemeteryReportExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportMissingDocumentsReportController extends Controller
{
    public function __construct(private ListMissingDocumentsReportAction $report) {}

    public function __invoke(MissingDocumentsReportRequest $request): BinaryFileResponse
    {
        $filters = MissingDocumentsReportFiltersDto::fromArray($request->filters());

        return Excel::download(
            new CemeteryReportExport(
                $this->report->headings(),
                $this->report->exportRows(app('municipal_id'), $filters),
            ),
            'cemetery-missing-documents-report-'.now()->format('Ymd-His').'.xlsx',
        );
    }
}
