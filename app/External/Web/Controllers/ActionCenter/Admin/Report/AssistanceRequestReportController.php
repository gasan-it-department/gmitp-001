<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Report;

use App\Core\ActionCenter\Dto\Report\AssistanceRequestReportFiltersDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\UseCase\Report\GetActionCenterReportFilterOptionsAction;
use App\Core\ActionCenter\UseCase\Report\ListAssistanceRequestReportAction;
use App\External\Api\Request\ActionCenter\Report\AssistanceRequestReportRequest;
use App\External\Api\Resources\ActionCenter\Report\ActionCenterReportRowResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AssistanceRequestReportController extends Controller
{
    public function __construct(
        private readonly ListAssistanceRequestReportAction $report,
        private readonly GetActionCenterReportFilterOptionsAction $filterOptions,
    ) {}

    public function __invoke(AssistanceRequestReportRequest $request): Response
    {
        $municipalId = app('municipal_id');
        $filters = AssistanceRequestReportFiltersDto::fromArray($request->filters());
        $options = $this->filterOptions->execute($municipalId);

        return Inertia::render('ActionCenter/Admin/Reports/AssistanceRequests', [
            'rows' => ActionCenterReportRowResource::collection($this->report->execute($municipalId, $filters)),
            'summary' => $this->report->summary($municipalId, $filters),
            'filters' => $filters->toArray(),
            'filterOptions' => [
                'assistanceTypes' => $options['assistance_types'],
                'barangays' => $options['request_barangays'],
                'statuses' => collect(AssistanceStatus::cases())->map(fn (AssistanceStatus $status) => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])->all(),
            ],
        ]);
    }
}
