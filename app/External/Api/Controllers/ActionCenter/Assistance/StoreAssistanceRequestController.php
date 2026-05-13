<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\StoreAssistanceRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
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
        $beneficiary = Beneficiary::with('household')
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (!$beneficiary->household) {
            return redirect()
                ->route('actionCenter.index', ['municipality' => $municipality])
                ->withErrors([
                    'profile' => 'Please complete your address and household profile before requesting assistance.',
                ]);
        }

        // Municipality guard: a citizen registered in another LGU cannot
        // submit to this LGU's programs even if they bypass the UI.
        if ($beneficiary->household->municipal_id !== $assistanceType->municipal_id) {
            throw new AuthorizationException(
                'You may only request assistance from the municipality where you reside.'
            );
        }

        $dto = StoreAssistanceRequestDto::fromRequest($request, $assistanceType, $beneficiary);

        $created = $this->storeAssistanceRequest->execute($dto);

        return redirect()
            ->route('actionCenter.portal', ['municipality' => $municipality])
            ->with('success', "Your request {$created->transaction_number} has been received. A social worker will contact you within 3 to 5 working days.");
    }
}
