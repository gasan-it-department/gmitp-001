<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports;

use App\Core\Cemetery\Actions\Reports\GetReportFilterOptionsAction;
use App\Core\Cemetery\Actions\Reports\ListLeaseExpiryReportAction;
use App\Core\Cemetery\Dto\Reports\LeaseReportFiltersDto;
use App\External\Api\Request\Cemetery\Reports\LeaseReportRequest;
use App\External\Api\Resources\Cemetery\Reports\CemeteryReportRowResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LeaseReportController extends Controller
{
    public function __construct(
        private ListLeaseExpiryReportAction $report,
        private GetReportFilterOptionsAction $filterOptions,
    ) {}

    public function __invoke(LeaseReportRequest $request): Response
    {
        $municipalId = app('municipal_id');
        $filters = LeaseReportFiltersDto::fromArray($request->filters());

        return Inertia::render('Cemetery/Admin/Reports/Leases', [
            'municipality' => app('current_municipality'),
            'rows' => CemeteryReportRowResource::collection($this->report->execute($municipalId, $filters)),
            'summary' => $this->report->summary($municipalId, $filters),
            'filters' => $filters->toArray(),
            'filter_options' => $this->filterOptions->execute($municipalId),
            'lease_state_options' => $this->leaseStateOptions(),
        ]);
    }

    private function leaseStateOptions(): array
    {
        return [
            ['value' => 'expired', 'label' => 'Expired'],
            ['value' => 'expiring_soon', 'label' => 'Expiring Soon'],
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'no_active_lease', 'label' => 'No Active Lease'],
            ['value' => 'all', 'label' => 'All'],
        ];
    }
}
