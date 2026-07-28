<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Report;

use App\Core\ActionCenter\Dto\Report\BeneficiaryRegistryReportFiltersDto;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\UseCase\Report\GetActionCenterReportFilterOptionsAction;
use App\Core\ActionCenter\UseCase\Report\ListBeneficiaryRegistryReportAction;
use App\External\Api\Request\ActionCenter\Report\BeneficiaryRegistryReportRequest;
use App\External\Api\Resources\ActionCenter\Report\ActionCenterReportRowResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BeneficiaryRegistryReportController extends Controller
{
    public function __construct(
        private readonly ListBeneficiaryRegistryReportAction $report,
        private readonly GetActionCenterReportFilterOptionsAction $filterOptions,
    ) {}

    public function __invoke(BeneficiaryRegistryReportRequest $request): Response
    {
        $municipalId = app('municipal_id');
        $filters = BeneficiaryRegistryReportFiltersDto::fromArray($request->filters());
        $options = $this->filterOptions->execute($municipalId);

        return Inertia::render('ActionCenter/Admin/Reports/Beneficiaries', [
            'rows' => ActionCenterReportRowResource::collection($this->report->execute($municipalId, $filters)),
            'summary' => $this->report->summary($municipalId, $filters),
            'filters' => $filters->toArray(),
            'filterOptions' => [
                'barangays' => $options['beneficiary_barangays'],
                'sexes' => collect(Sex::cases())->map(fn (Sex $sex) => [
                    'value' => $sex->value,
                    'label' => $sex->label(),
                ])->all(),
            ],
        ]);
    }
}
