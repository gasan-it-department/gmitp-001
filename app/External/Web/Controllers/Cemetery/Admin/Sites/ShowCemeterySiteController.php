<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Sites;

use App\Core\Cemetery\Actions\GetPlotInventoryCountsAction;
use App\Core\Cemetery\Actions\ListPlotsAction;
use App\Core\Cemetery\Actions\Sites\GetCemeterySiteAction;
use App\Core\Cemetery\Enums\PlotStatus;
use App\External\Api\Resources\Cemetery\PlotListResource;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowCemeterySiteController extends Controller
{
    public function __construct(
        private GetCemeterySiteAction $getCemeterySite,
        private ListPlotsAction $listPlots,
        private GetPlotInventoryCountsAction $getPlotInventoryCounts,
    ) {}

    public function __invoke(Request $request, string $municipality, string $cemetery_site_id): Response
    {
        $municipalId = app('municipal_id');
        $status = $request->query('status');
        $site = $this->getCemeterySite->execute($municipalId, $cemetery_site_id);
        $plots = $this->listPlots->execute($municipalId, $site->id, $status);
        $counts = $this->getPlotInventoryCounts->execute($municipalId, $site->id);

        return Inertia::render('Cemetery/Admin/Site/Workspace/CemeterySiteWorkspace', [
            'municipality' => app('current_municipality'),
            'site' => CemeterySiteResource::make($site)->resolve(),
            'plots' => PlotListResource::collection($plots),
            'filters' => ['status' => $status],
            'status_options' => PlotStatus::toOptions(),
            'inventory_counts' => $counts,
        ]);
    }
}
