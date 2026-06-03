<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Plots;

use App\Core\Cemetery\Actions\GetPlotInventoryCountsAction;
use App\Core\Cemetery\Actions\ListPlotsAction;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\External\Api\Resources\Cemetery\PlotListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin plots index page. Renders containers + single-capacity rows; child
 * slots are reached by drilling into the parent-detail page (MD §7 Workflow B).
 *
 * The page header KPIs ("Available", "Occupied", …) are LEAF-level counts
 * computed server-side by `GetPlotInventoryCountsAction` — they reflect the
 * real bookable inventory (not just what fits on the current page) and
 * exclude parent containers so the math stays honest (REQ-2.2).
 */
class ListPlotsController extends Controller
{
    public function __construct(
        private ListPlotsAction $listPlots,
        private GetPlotInventoryCountsAction $getPlotInventoryCounts,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $municipalId = app('municipal_id');
        $status = $request->query('status');

        $plots = $this->listPlots->execute($municipalId, $status);
        $counts = $this->getPlotInventoryCounts->execute($municipalId);

        return Inertia::render('Cemetery/Admin/Plots/List/ListPlots', [
            'plots' => PlotListResource::collection($plots),
            'filters' => ['status' => $status],
            'status_options' => PlotStatus::toOptions(),
            'type_options' => PlotTypes::toOptions(),
            'inventory_counts' => $counts,
        ]);
    }
}
