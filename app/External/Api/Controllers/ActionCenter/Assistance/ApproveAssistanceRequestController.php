<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\ApproveAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\ApproveAssistanceRequestRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "Approve Assistance Request" endpoint.
 *
 * Route: POST /api/action-center/assistance-request/{assistanceRequestId}/approve
 *
 * Thin controller — no queries, no model loads, no business rules. It only:
 *   • validates the payload shape (via ApproveAssistanceRequestRequest)
 *   • collects tenant context + authenticated approver id
 *   • builds the DTO from primitives and hands off to the action
 *   • translates domain / authorization exceptions to flash-message redirects
 *
 * All business rules (status transition, amount bounds, required-docs
 * presence, cooldown fan-out) live in ApproveAssistanceRequestAction.
 */
class ApproveAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly ApproveAssistanceRequestAction $approve,
    ) {
    }

    public function __invoke(
        string $assistanceRequestId,
        ApproveAssistanceRequestRequest $request,
    ): RedirectResponse {
        try {
            $dto = ApproveAssistanceRequestDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                approverId: Auth::id(),
            );

            $this->approve->execute($dto);

            return back()->with(
                'success',
                'Request approved. Cooldown is now in effect against future applications.',
            );
        } catch (\DomainException $e) {
            // Illegal transition, missing required documents, amount out of
            // bounds, no reviewer assigned, etc. Surface the action's
            // message verbatim — they're already user-friendly.
            return back()->withErrors(['approve' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            // Cross-tenant attempt.
            return back()->withErrors(['approve' => $e->getMessage()]);
        }
    }
}
