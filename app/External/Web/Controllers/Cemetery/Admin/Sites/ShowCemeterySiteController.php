<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Sites;

use App\Core\Cemetery\Actions\GetPlotInventoryCountsAction;
use App\Core\Cemetery\Actions\Interments\ListSiteIntermentsAction;
use App\Core\Cemetery\Actions\ListPlotsAction;
use App\Core\Cemetery\Actions\Sites\GetCemeterySiteAction;
use App\Core\Cemetery\Actions\Sites\GetCemeterySiteLayoutAction;
use App\Core\Cemetery\Dto\Plots\PlotListFiltersDto;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\External\Api\Request\Cemetery\Plots\ListPlotsRequest;
use App\External\Api\Resources\Cemetery\Interments\IntermentListResource;
use App\External\Api\Resources\Cemetery\PlotListResource;
use App\External\Api\Resources\Cemetery\Sites\CemeterySectionLayoutResource;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowCemeterySiteController extends Controller
{
    public function __construct(
        private GetCemeterySiteAction $getCemeterySite,
        private ListPlotsAction $listPlots,
        private GetPlotInventoryCountsAction $getPlotInventoryCounts,
        private GetCemeterySiteLayoutAction $getCemeterySiteLayout,
        private ListSiteIntermentsAction $listSiteInterments,
    ) {}

    public function __invoke(ListPlotsRequest $request, string $municipality, string $cemetery_site_id): Response
    {
        $municipalId = app('municipal_id');
        $filters = PlotListFiltersDto::fromArray($request->filters());
        $site = $this->getCemeterySite->execute($municipalId, $cemetery_site_id);
        $plots = $this->listPlots->execute($municipalId, $site->id, $filters);
        $counts = $this->getPlotInventoryCounts->execute($municipalId, $site->id);
        $layout = $this->getCemeterySiteLayout->execute($municipalId, $site->id);
        $interments = $this->listSiteInterments->execute($municipalId, $site->id);

        return Inertia::render('Cemetery/Admin/Site/Workspace/CemeterySiteWorkspace', [
            'municipality' => app('current_municipality'),
            'site' => CemeterySiteResource::make($site)->resolve(),
            'layout' => CemeterySectionLayoutResource::collection($layout)->resolve(),
            'interments' => IntermentListResource::collection($interments)->resolve(),
            'plots' => PlotListResource::collection($plots),
            'filters' => $filters->toArray(),
            'status_options' => PlotStatus::toOptions(),
            'type_options' => PlotTypes::toOptions(),
            'inventory_counts' => $counts,
        ]);
    }
}
