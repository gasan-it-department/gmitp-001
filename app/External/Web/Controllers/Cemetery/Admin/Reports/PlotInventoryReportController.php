<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports;

use App\Core\Cemetery\Actions\Reports\GetReportFilterOptionsAction;
use App\Core\Cemetery\Actions\Reports\ListPlotInventoryReportAction;
use App\Core\Cemetery\Dto\Reports\PlotInventoryReportFiltersDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\External\Api\Request\Cemetery\Reports\PlotInventoryReportRequest;
use App\External\Api\Resources\Cemetery\Reports\CemeteryReportRowResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PlotInventoryReportController extends Controller
{
    public function __construct(
        private ListPlotInventoryReportAction $report,
        private GetReportFilterOptionsAction $filterOptions,
    ) {}

    public function __invoke(PlotInventoryReportRequest $request): Response
    {
        $municipalId = app('municipal_id');
        $filters = PlotInventoryReportFiltersDto::fromArray($request->filters());

        return Inertia::render('Cemetery/Admin/Reports/Plots', [
            'municipality' => app('current_municipality'),
            'rows' => CemeteryReportRowResource::collection($this->report->execute($municipalId, $filters)),
            'summary' => $this->report->summary($municipalId, $filters),
            'filters' => $filters->toArray(),
            'filter_options' => $this->filterOptions->execute($municipalId),
            'type_options' => PlotTypes::toOptions(),
            'status_options' => PlotStatus::toOptions(),
            'occupancy_mode_options' => array_map(fn (PlotOccupancyMode $mode) => [
                'value' => $mode->value,
                'label' => $mode->label(),
            ], PlotOccupancyMode::cases()),
            'scope_options' => [
                ['value' => 'assignable', 'label' => 'Assignable Plots'],
                ['value' => 'containers', 'label' => 'Apartment Containers'],
                ['value' => 'all', 'label' => 'All Plot Rows'],
            ],
        ]);
    }
}
