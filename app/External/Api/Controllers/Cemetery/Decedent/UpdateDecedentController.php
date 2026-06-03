<?php

namespace App\External\Api\Controllers\Cemetery\Decedent;

use App\Core\Cemetery\Actions\UpdateDecedentAction;
use App\Core\Cemetery\Dto\DecedentDto;
use App\External\Api\Request\Cemetery\UpdateDecedentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

/**
 * Mutation endpoint for "edit decedent" (Inertia form put).
 *
 * Lives in the API layer per the module's command/query split. Validate via the
 * API UpdateDecedentRequest, hand a DTO + the route-bound id to the use case,
 * redirect back to the profile. Sits in the api/decedents route group (no
 * {municipality} segment), so the slug for the redirect is read from the bound
 * container instance set by SetMunicipalityContext.
 */
class UpdateDecedentController extends Controller
{
    public function __construct(
        private UpdateDecedentAction $updateDecedent,
    ) {
    }

    public function __invoke(UpdateDecedentRequest $request, string $decedentId): RedirectResponse
    {
        $decedent = $this->updateDecedent->execute(
            DecedentDto::fromRequest($request->validated()),
            $decedentId
        );

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => app('current_municipality')->slug,
            'decedent_id' => $decedent->id,
        ])->with('success', 'Decedent updated successfully.');
    }
}
