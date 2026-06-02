<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\StorePlotAction;
use App\Core\Cemetery\Dto\PlotDto;
use App\External\Api\Request\Cemetery\CreatePlotRequest;
use App\Http\Controllers\Controller;

/**
 * Single-action controller that creates a new plot. The boundary is paper-thin:
 * validate → build DTO → execute use case → redirect.
 */
class StorePlotController extends Controller
{
    public function __construct(
        private StorePlotAction $storePlot,
    ) {
    }

    public function __invoke(CreatePlotRequest $request)
    {
        $municipality = app('current_municipality');

        $this->storePlot->execute(PlotDto::fromCreateRequest($request));

        return redirect()->route('cemetery.admin.plots.list.page', [
            'municipality' => $municipality->slug,
        ])->with('success', 'Plot registered successfully.');
    }
}
