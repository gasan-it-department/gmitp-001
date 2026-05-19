<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\StartAssistanceRequestReviewAction;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "Pick Up Case" endpoint.
 *
 * Route: POST /api/action-center/assistance-request/{assistanceRequestId}/start-review
 *
 * Thin controller — no queries, no model loads, no business rules. It only:
 *   • collects the tenant context (municipal_id) and acting user (reviewer id)
 *   • delegates the entire mutation to StartAssistanceRequestReviewAction
 *   • translates domain exceptions back to a flash-message redirect
 *
 * Route binds the ULID as a STRING (not a model). The action then re-reads
 * the row under SELECT … FOR UPDATE so the locked row IS the row we mutate —
 * a route-model binding would be a stale read.
 */
class StartAssistanceRequestReviewController extends Controller
{
    public function __construct(
        private readonly StartAssistanceRequestReviewAction $startReview,
    ) {
    }

    public function __invoke(string $assistanceRequestId): RedirectResponse
    {
        try {
            $this->startReview->execute(
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                reviewerId: Auth::id(),
            );

            return back()->with(
                'success',
                'Case picked up. You are now the assigned reviewer.'
            );
        } catch (\DomainException $e) {
            // Illegal status transition — usually "already picked up by someone else"
            // or the case is already decided.
            return back()->withErrors(['status' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            // Cross-tenant attempt.
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }
}
