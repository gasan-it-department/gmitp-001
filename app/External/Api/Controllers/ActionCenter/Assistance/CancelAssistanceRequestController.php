<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CancelAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\CancelAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\CancelAssistanceRequestRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Citizen "Cancel My Assistance Request" endpoint.
 *
 * Route: POST /api/action-center/assistance-request/{assistanceRequestId}/cancel
 *
 * Behind `auth` + `municipalityContext` middleware (NOT `admin` — this is
 * citizen-driven). Ownership of the target request is enforced inside the
 * action by checking the linked beneficiary's user_id; the middleware only
 * guarantees the caller is some authenticated citizen of this municipality.
 *
 * Thin controller — no queries, no model loads, no rules. It only:
 *   • validates the payload shape (optional reason; see FormRequest)
 *   • collects tenant context + authenticated user id
 *   • builds the DTO and hands off
 *   • translates domain / authorization exceptions to flash-message redirects
 */
class CancelAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly CancelAssistanceRequestAction $cancel,
    ) {
    }

    public function __invoke(
        CancelAssistanceRequestRequest $request,
        string $assistanceRequestId,
    ): RedirectResponse {
        try {
            $dto = CancelAssistanceRequestDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                userId: Auth::id(),
            );

            $this->cancel->execute($dto);

            return back()->with(
                'success',
                'Your assistance request has been cancelled.',
            );
        } catch (\DomainException $e) {
            // Wrong state (already approved/released/rejected/cancelled).
            return back()->withErrors(['cancel' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            // Cross-tenant or non-owner attempt.
            return back()->withErrors(['cancel' => $e->getMessage()]);
        }
    }
}
