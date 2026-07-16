<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports;

use App\Core\Cemetery\Actions\Reports\ListMissingDocumentsReportAction;
use App\Core\Cemetery\Dto\Reports\MissingDocumentsReportFiltersDto;
use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\External\Api\Request\Cemetery\Reports\MissingDocumentsReportRequest;
use App\External\Api\Resources\Cemetery\Reports\CemeteryReportRowResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MissingDocumentsReportController extends Controller
{
    public function __construct(private ListMissingDocumentsReportAction $report) {}

    public function __invoke(MissingDocumentsReportRequest $request): Response
    {
        $municipalId = app('municipal_id');
        $filters = MissingDocumentsReportFiltersDto::fromArray($request->filters());

        return Inertia::render('Cemetery/Admin/Reports/MissingDocuments', [
            'municipality' => app('current_municipality'),
            'rows' => CemeteryReportRowResource::collection($this->report->execute($municipalId, $filters)),
            'summary' => $this->report->summary($municipalId, $filters),
            'filters' => $filters->toArray(),
            'registration_status_options' => RegistrationStatus::toOptions(),
            'vital_record_type_options' => VitalRecordType::toOptions(),
            'document_type_options' => DecedentDocumentType::toOptions(),
            'interment_status_options' => [
                ['value' => 'interred', 'label' => 'Interred'],
                ['value' => 'unassigned', 'label' => 'Unassigned'],
                ['value' => 'exhumed', 'label' => 'Exhumed'],
                ['value' => 'transferred_out', 'label' => 'Transferred Out'],
            ],
        ]);
    }
}
