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
 * RecordIntermentAction (which atomically creates the interment row and flips
 * the slot to OCCUPIED under a pessimistic lock), redirect to the decedent's
 * profile with a flash success.
 */
class StoreIntermentController extends Controller
{
    public function __construct(
        private RecordIntermentAction $recordInterment,
    ) {
    }

    public function __invoke(CreateIntermentRequest $request): RedirectResponse
    {
        $municipality = app('current_municipality');

        $interment = $this->recordInterment->execute(
            IntermentDto::fromRequest($request->validated())
        );

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => $municipality->slug,
            'decedent_id' => $interment->decedent_id,
        ])->with('success', 'Decedent successfully assigned to the selected plot.');
    }
}
