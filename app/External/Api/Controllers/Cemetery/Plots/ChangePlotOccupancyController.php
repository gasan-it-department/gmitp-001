<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\ChangePlotOccupancyAction;
use App\Core\Cemetery\Dto\Plots\ChangePlotOccupancyDto;
use App\External\Api\Request\Cemetery\Plots\ChangePlotOccupancyRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ChangePlotOccupancyController extends Controller
{
    public function __construct(
        private ChangePlotOccupancyAction $changePlotOccupancy,
    ) {}

    public function __invoke(ChangePlotOccupancyRequest $request, string $cemetery_site_id, string $plot_id): RedirectResponse
    {
        $plot = $this->changePlotOccupancy->execute(
            ChangePlotOccupancyDto::fromRequest($request->validated(), $cemetery_site_id, $plot_id)
        );

        return redirect()->route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => app('current_municipality')->slug,
            'cemetery_site_id' => $plot->cemetery_site_id,
            'plot_id' => $plot->id,
        ])->with('success', 'Plot occupancy updated.');
    }
}
