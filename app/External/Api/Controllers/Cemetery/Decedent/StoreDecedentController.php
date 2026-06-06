<?php

namespace App\External\Api\Controllers\Cemetery\Decedent;

use App\Core\Cemetery\Actions\StoreDecedentAction;
use App\Core\Cemetery\Dto\DecedentDto;
use App\External\Api\Request\Cemetery\CreateDecedentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

/**
 * Mutation endpoint for "create new decedent" (Inertia form post).
 *
 * Lives in the API layer per the module's command/query split — mutations are
 * API controllers, page renders are Web controllers (mirrors the Announcement
 * gold standard). Thin HTTP boundary: validate via the API CreateDecedentRequest,
 * hand a DTO to the use case, redirect to the new profile page. No model access
 * here — the use case/repository own the data layer.
 */
class StoreDecedentController extends Controller
{
    public function __construct(
        private StoreDecedentAction $storeDecedent,
    ) {
    }

    public function __invoke(CreateDecedentRequest $request): RedirectResponse
    {
        $municipality = app('current_municipality');

        $decedent = $this->storeDecedent->execute(
            DecedentDto::fromRequest($request->validated())
        );

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => $municipality->slug,
            'decedent_id' => $decedent->id,
        ])->with('success', 'Decedent registered successfully.');
    }
}
