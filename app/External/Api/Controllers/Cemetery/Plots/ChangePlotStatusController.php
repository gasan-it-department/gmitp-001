<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\ChangePlotStatusAction;
use App\Core\Cemetery\Dto\Plots\ChangePlotStatusDto;
use App\External\Api\Request\Cemetery\Plots\ChangePlotStatusRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ChangePlotStatusController extends Controller
{
    public function __construct(
        private ChangePlotStatusAction $changePlotStatus,
    ) {}

    public function __invoke(ChangePlotStatusRequest $request, string $cemetery_site_id, string $plot_id): RedirectResponse
    {
        $plot = $this->changePlotStatus->execute(
            ChangePlotStatusDto::fromRequest($request->validated(), $cemetery_site_id, $plot_id)
        );

        return redirect()->route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => app('current_municipality')->slug,
            'cemetery_site_id' => $plot->cemetery_site_id,
            'plot_id' => $plot->id,
        ])->with('success', 'Plot status updated.');
    }
}
