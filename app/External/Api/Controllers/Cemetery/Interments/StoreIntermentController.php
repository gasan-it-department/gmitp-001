<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Actions\RecordIntermentAction;
use App\Core\Cemetery\Dto\IntermentDto;
use App\External\Api\Request\Cemetery\CreateIntermentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

/**
 * Mutation endpoint for "assign decedent to a slot" (REQ-3.1, FR-6). Thin HTTP
 * boundary: validate the API CreateIntermentRequest, build the DTO, run
 * RecordIntermentAction (which atomically creates the interment row and updates
 * plot occupancy under a pessimistic lock), then redirect to the correct
 * operational surface.
 */
class StoreIntermentController extends Controller
{
    public function __construct(
        private RecordIntermentAction $recordInterment,
    ) {}

    public function __invoke(CreateIntermentRequest $request): RedirectResponse
    {
        $municipality = app('current_municipality');

        $interment = $this->recordInterment->execute(
            IntermentDto::fromRequest($request->validated())
        );

        if ($request->validated('cemetery_site_id')) {
            return redirect()->route('cemetery.admin.sites.plots.profile.page', [
                'municipality' => $municipality->slug,
                'cemetery_site_id' => $request->validated('cemetery_site_id'),
                'plot_id' => $interment->plot_id,
            ])->with('success', 'Interment recorded successfully. Add a leaseholder from this Plot Profile when ready.');
        }

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => $municipality->slug,
            'decedent_id' => $interment->decedent_id,
        ])->with('success', 'Decedent successfully assigned to the selected plot.');
    }
}
