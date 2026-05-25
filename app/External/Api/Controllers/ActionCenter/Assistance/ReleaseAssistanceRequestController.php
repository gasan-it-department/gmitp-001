<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReleaseAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\ReleaseAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\ReleaseAssistanceRequestRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

/**
 * Cashier "Mark as Released" endpoint.
 *
 * Route: POST /api/action-center/assistance-request/{assistanceRequestId}/release
 *
 * Thin controller — no queries, no model loads, no rules. It only:
 *   • validates the payload shape (via ReleaseAssistanceRequestRequest)
 *   • resolves tenant context + the authenticated cashier's id + display name
 *   • builds the DTO from primitives and hands off to the action
 *   • translates domain / authorization exceptions to flash-message redirects
 *
 * All business rules (tenant, transition, amount integrity, reference
 * uniqueness, COA-immutable stamping) live in ReleaseAssistanceRequestAction.
 */
class ReleaseAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly ReleaseAssistanceRequestAction $release,
    ) {
    }

    public function __invoke(
        ReleaseAssistanceRequestRequest $request,
        string $assistanceRequestId,
    ): RedirectResponse {
        try {
            $user = $request->user();

            $dto = ReleaseAssistanceRequestDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                cashierId: $user->id,
                cashierName: $user->full_name,
            );

            $this->release->execute($dto);

            return back()->with(
                'success',
                'Release recorded. This entry is now COA-immutable.',
            );
        } catch (\DomainException $e) {
            // Wrong status, missing amount, duplicate reference number.
            return back()->withErrors(['release' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            // Cross-tenant attempt.
            return back()->withErrors(['release' => $e->getMessage()]);
        }
    }
}
