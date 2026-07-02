<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\DeletePlotAction;
use App\Core\Cemetery\Dto\Plots\DeletePlotDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\External\Api\Request\Cemetery\Plots\DeletePlotRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeletePlotController extends Controller
{
    public function __construct(
        private DeletePlotAction $deletePlot,
    ) {}

    public function __invoke(DeletePlotRequest $request, string $cemetery_site_id, string $plot_id): RedirectResponse
    {
        $plot = $this->deletePlot->execute(
            DeletePlotDto::fromRequest($request->validated(), $cemetery_site_id, $plot_id)
        );
        $municipality = app('current_municipality');

        if ($plot->parent_plot_id !== null) {
            return redirect()->route('cemetery.admin.sites.plots.profile.page', [
                'municipality' => $municipality->slug,
                'cemetery_site_id' => $plot->cemetery_site_id,
                'plot_id' => $plot->parent_plot_id,
            ])->with('success', 'Niche slot deleted.');
        }

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $plot->cemetery_site_id,
        ])->with('success', $plot->occupancy_mode === PlotOccupancyMode::SLOTTED ? 'Apartment deleted.' : 'Plot deleted.');
    }
}
