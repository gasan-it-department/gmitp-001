<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\UseCase\CreatePlotUseCase;
use App\External\Api\Request\Cemetery\CreatePlotRequest;
use App\Http\Controllers\Controller;

/**
 * Single-action controller that creates a new plot. The boundary is paper-thin:
 * validate → build DTO → execute use case → redirect.
 */
class StorePlotController extends Controller
{
    public function __construct(
        private CreatePlotUseCase $createPlot,
    ) {
    }

    public function __invoke(CreatePlotRequest $request)
    {
        $municipality = app('current_municipality');

        $this->createPlot->execute(PlotDto::fromCreateRequest($request));

        return redirect()->route('cemetery.admin.plots.list.page', [
            'municipality' => $municipality->slug,
        ])->with('success', 'Plot registered successfully.');
    }
}
