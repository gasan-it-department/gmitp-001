<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\BulkGenerateMultiCapacityPlotsAction;
use App\Core\Cemetery\Dto\PlotDto;
use App\External\Api\Request\Cemetery\CreatePlotRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

/**
 * Mutation endpoint for "register plot". Thin HTTP boundary: validate the API
 * CreatePlotRequest, build the DTO, run the Action (which handles both single-
 * and multi-capacity in one transaction), redirect to the plots list with a
 * flash success.
 *
 * Lives in the API layer per the module's command/query split (mirrors the
 * Announcement gold standard). No model access here.
 */
class StorePlotController extends Controller
{
    public function __construct(
        private BulkGenerateMultiCapacityPlotsAction $bulkGeneratePlots,
    ) {
    }

    public function __invoke(CreatePlotRequest $request): RedirectResponse
    {
        $municipality = app('current_municipality');

        $this->bulkGeneratePlots->execute(
            PlotDto::fromRequest($request->validated())
        );

        return redirect()->route('cemetery.admin.plots.list.page', [
            'municipality' => $municipality->slug,
        ])->with('success', 'Plot registered successfully.');
    }
}
