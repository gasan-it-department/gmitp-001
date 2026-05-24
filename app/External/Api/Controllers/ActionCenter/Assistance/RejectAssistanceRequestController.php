<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\RejectAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\RejectAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\RejectAssistanceRequestRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

/**
 * Admin "Reject Assistance Request" endpoint.
 *
 * Route: POST /api/action-center/assistance-request/{assistanceRequestId}/reject
 *
 * Thin controller — no queries, no model loads, no rules. It only:
 *   • validates the payload shape (via RejectAssistanceRequestRequest)
 *   • resolves tenant context + the authenticated rejecter's id + display name
 *   • builds the DTO from primitives and hands off to the action
 *   • translates domain / authorization exceptions to flash-message redirects
 *
 * All business rules (transition check, tenant guard, remarks append) live
 * in RejectAssistanceRequestAction.
 */
class RejectAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly RejectAssistanceRequestAction $reject,
    ) {
    }

    public function __invoke(
        RejectAssistanceRequestRequest $request,
        string $assistanceRequestId,
    ): RedirectResponse {
        try {
            $user = $request->user();

            $dto = RejectAssistanceRequestDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                userId: $user->id,
                userName: $user->full_name,
            );

            $this->reject->execute($dto);

            return back()->with(
                'success',
                'The assistance request has been rejected and the citizen will be notified.',
            );
        } catch (\DomainException $e) {
            // Illegal transition (e.g. trying to reject an approved or
            // already-rejected case). Message is user-friendly.
            return back()->withErrors(['reject' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            // Cross-tenant attempt.
            return back()->withErrors(['reject' => $e->getMessage()]);
        }
    }
}
