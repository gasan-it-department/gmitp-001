<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\StorePlotLeaseAction;
use App\Core\Cemetery\Dto\Plots\UpdatePlotLeaseDto;
use App\External\Api\Request\Cemetery\Plots\UpdatePlotLeaseRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StorePlotLeaseController extends Controller
{
    public function __construct(
        private StorePlotLeaseAction $storePlotLease,
    ) {}

    public function __invoke(UpdatePlotLeaseRequest $request, string $cemetery_site_id, string $plot_id): RedirectResponse
    {
        $lease = $this->storePlotLease->execute(
            UpdatePlotLeaseDto::fromRequest($request->validated(), $cemetery_site_id, $plot_id)
        );

        return redirect()->route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => app('current_municipality')->slug,
            'cemetery_site_id' => $cemetery_site_id,
            'plot_id' => $lease->plot_id,
        ])->with('success', 'Plot lease recorded.');
    }
}
