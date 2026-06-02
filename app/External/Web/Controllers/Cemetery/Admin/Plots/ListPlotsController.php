<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Plots;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\Core\Cemetery\Actions\ListPlotsAction;
use App\External\Api\Resources\Cemetery\PlotListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Admin plots index page. Renders a filterable table of plots scoped to
 * the current municipality.
 */
class ListPlotsController extends Controller
{
    public function __construct(
        private ListPlotsAction $listPlots,
    ) {
    }

    public function __invoke(Request $request)
    {
        $municipalId = app('municipal_id');
        $status = $request->query('status');

        $plots = $this->listPlots->execute($municipalId, $status);

        return Inertia::render('Cemetery/Admin/Plots/List/ListPlots', [
            'plots' => PlotListResource::collection($plots),
            'filters' => ['status' => $status],
            'status_options' => PlotStatus::toOptions(),
            'type_options' => PlotTypes::toOptions(),
        ]);
    }
}
