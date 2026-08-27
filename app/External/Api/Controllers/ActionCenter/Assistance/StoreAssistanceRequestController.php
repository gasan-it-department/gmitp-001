<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\Exceptions\AssistanceEligibilityException;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveApplicantProfileAction;
use App\External\Api\Request\ActionCenter\StoreAssistanceRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

/**
 * Handles the POST submission from the online citizen Apply form.
 *
 * Route: POST /{municipality}/action-center/apply/{assistanceType:slug}
 *
 * Responsibilities (kept thin — actual work lives in StoreAssistanceRequestAction):
 *  1. Resolve the authenticated user's beneficiary record.
 *  2. Verify the beneficiary's municipality matches the program's municipality.
 *  3. Build the DTO and hand off to the action.
 *  4. Redirect to the portal with a success flash + transaction number.
 */
class StoreAssistanceRequestController extends Controller
{
    public function __construct(
        private StoreAssistanceRequestAction $storeAssistanceRequest,
        private ResolveApplicantProfileAction $resolveApplicantProfileAction,
        private CheckElegibilityAction $checkEligibility,
    ) {
    }

    public function __invoke(
        StoreAssistanceRequest $request,
        string $municipality,
        AssistanceType $assistanceType,
    ): RedirectResponse {
        $user = $request->user();

        // The beneficiary record is the verified identity for the citizen.
        // We refuse to submit on behalf of users who haven't completed the profile wizard.
        $beneficiary = $this->resolveApplicantProfileAction->execute($request->user()->id, app('municipal_id'));

        if (!$beneficiary || !$beneficiary->household) {
            return redirect()
                ->route('actionCenter.index', ['municipality' => $municipality])
                ->withErrors([
                    'profile' => 'Please complete your address and household profile before requesting assistance.',
                ]);
        }

        // Server-side eligibility gate (cooldown / in-flight / one-time). This is
        // the REAL lock — the disabled portal card is only UI. For Burial the
        // on-behalf deceased context makes the check per-deceased. Throwing the
        // domain exception surfaces the friendly message as a toast.
        //
        // Cooldown and request-history rules are enforced here on the citizen
        // path. StoreAssistanceRequestAction separately enforces the non-
        // overridable active-beneficiary and active-household-head invariants.
        $eligibility = $this->checkEligibility->execute(
            $beneficiary,
            $assistanceType,
            $request->input('on_behalf_household_member_id') ?: null,
            $request->input('on_behalf_date_of_death') ?: null,
            allowPendingDependent: true,
        );

        if (!$eligibility->eligible) {
            throw AssistanceEligibilityException::from($eligibility);
        }

        $dto = StoreAssistanceRequestDto::fromRequest(
            $request,
            $assistanceType,
            $beneficiary,
            app('current_municipality')->municipal_code,
        );

        $created = $this->storeAssistanceRequest->execute($dto);

        return redirect()
            ->route('actionCenter.portal', ['municipality' => $municipality])
            ->with(
                'success',
                "Your request {$created->transaction_number} has been recorded. Prepare the listed documents, bring the physical originals to MSWD, and present this transaction number when you arrive.",
            );
    }
}
