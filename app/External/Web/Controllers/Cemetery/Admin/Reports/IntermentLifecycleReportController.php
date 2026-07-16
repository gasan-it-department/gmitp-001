<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports;

use App\Core\Cemetery\Actions\Reports\GetReportFilterOptionsAction;
use App\Core\Cemetery\Actions\Reports\ListIntermentLifecycleReportAction;
use App\Core\Cemetery\Dto\Reports\IntermentLifecycleReportFiltersDto;
use App\Core\Cemetery\Enums\IntermentEndType;
use App\External\Api\Request\Cemetery\Reports\IntermentLifecycleReportRequest;
use App\External\Api\Resources\Cemetery\Reports\CemeteryReportRowResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IntermentLifecycleReportController extends Controller
{
    public function __construct(
        private ListIntermentLifecycleReportAction $report,
        private GetReportFilterOptionsAction $filterOptions,
    ) {}

    public function __invoke(IntermentLifecycleReportRequest $request): Response
    {
        $municipalId = app('municipal_id');
        $filters = IntermentLifecycleReportFiltersDto::fromArray($request->filters());

        return Inertia::render('Cemetery/Admin/Reports/Interments', [
            'municipality' => app('current_municipality'),
            'rows' => CemeteryReportRowResource::collection($this->report->execute($municipalId, $filters)),
            'summary' => $this->report->summary($municipalId, $filters),
            'filters' => $filters->toArray(),
            'filter_options' => $this->filterOptions->execute($municipalId),
            'lifecycle_status_options' => [
                ['value' => 'all', 'label' => 'All'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'moved', 'label' => 'Moved'],
                ['value' => 'exhumed', 'label' => 'Exhumed'],
                ['value' => 'transferred_out', 'label' => 'Transferred Out'],
                ['value' => 'voided', 'label' => 'Voided'],
            ],
            'end_type_options' => array_map(fn (IntermentEndType $type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ], IntermentEndType::cases()),
        ]);
    }
}
