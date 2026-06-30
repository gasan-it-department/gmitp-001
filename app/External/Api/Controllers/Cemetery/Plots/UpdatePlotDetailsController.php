<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\UpdatePlotDetailsAction;
use App\Core\Cemetery\Dto\Plots\UpdatePlotDetailsDto;
use App\External\Api\Request\Cemetery\Plots\UpdatePlotDetailsRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdatePlotDetailsController extends Controller
{
    public function __construct(
        private UpdatePlotDetailsAction $updatePlotDetails,
    ) {}

    public function __invoke(UpdatePlotDetailsRequest $request, string $cemetery_site_id, string $plot_id): RedirectResponse
    {
        $plot = $this->updatePlotDetails->execute(
            UpdatePlotDetailsDto::fromRequest($request->validated(), $cemetery_site_id, $plot_id)
        );

        return redirect()->route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => app('current_municipality')->slug,
            'cemetery_site_id' => $plot->cemetery_site_id,
            'plot_id' => $plot->id,
        ])->with('success', 'Plot details updated.');
    }
}
