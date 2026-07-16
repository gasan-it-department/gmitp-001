<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Actions\Interments\ReverseMovedIntermentAction;
use App\Core\Cemetery\Dto\Interments\ReverseMovedIntermentDto;
use App\External\Api\Request\Cemetery\Interments\ReverseMovedIntermentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ReverseMovedIntermentController extends Controller
{
    public function __construct(
        private ReverseMovedIntermentAction $reverseMovedInterment,
    ) {}

    public function __invoke(ReverseMovedIntermentRequest $request, string $interment_id): RedirectResponse
    {
        $municipality = app('current_municipality');
        $restored = $this->reverseMovedInterment->execute(
            ReverseMovedIntermentDto::fromRequest($interment_id, $request->validated())
        );

        return redirect()->route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $restored->plot?->cemetery_site_id,
            'plot_id' => $restored->plot_id,
        ])->with('success', 'Interment move reversed and previous plot restored.');
    }
}
