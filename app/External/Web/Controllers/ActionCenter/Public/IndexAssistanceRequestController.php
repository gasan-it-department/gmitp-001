<?php

namespace App\External\Web\Controllers\ActionCenter\Public;

use App\Core\ActionCenter\UseCase\Assistance\ListActiveAssistanceTypeAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveApplicantProfileAction;
use App\External\Api\Resources\ActionCenter\AssistanceType\AssistanceTypeListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Citizen portal — the card grid of every active assistance program.
 *
 * For each card we also surface a per-program eligibility result so the
 * frontend can disable a card the moment the citizen has a pending request,
 * is on cooldown, or has already consumed a one-time program. Without this
 * the citizen would happily click "Apply" only to be rejected on submission.
 *
 * Eligibility is only computed for authenticated citizens with a complete
 * profile. Guests and profile-incomplete users see every card enabled — the
 * Apply route itself will redirect them to login / profile-setup as needed.
 */
class IndexAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly ListActiveAssistanceTypeAction $listAssistanceTypes,
        private readonly ResolveApplicantProfileAction $resolveProfile,
        private readonly CheckElegibilityAction $checkEligibility,
    ) {
    }

    public function __invoke(Request $request)
    {
        $assistanceTypes = $this->listAssistanceTypes->execute(app('municipal_id'));

        // Only compute per-card eligibility once we know who the citizen is
        // AND they've completed profile setup (a beneficiary row exists).
        // The frontend treats an empty map as "no per-card gating" and just
        // shows every card enabled.
        $eligibilityByType = [];

        if ($user = $request->user()) {
            $beneficiary = $this->resolveProfile->execute($user->id, app('municipal_id'));

            if ($beneficiary !== null) {
                $eligibilityByType = collect(
                    $this->checkEligibility->executeBatch($beneficiary, $assistanceTypes)
                )
                    ->map(fn($result) => $result->toArray())
                    ->all();

            }
        }

        return Inertia::render('ActionCenter/Public/ActionCenterPortal', [
            'assistanceTypes' => AssistanceTypeListResource::collection($assistanceTypes),
            // Per-card eligibility so the grid can disable cards the citizen
            // can't currently apply for. Empty map (guest / no profile) → the
            // frontend treats every card as enabled.
            'eligibilityByType' => $eligibilityByType,
        ]);
    }
}
