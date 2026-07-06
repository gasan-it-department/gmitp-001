<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**

 * ── Lock-order contract ────────────────────────────────────────────────
 * This action locks EXACTLY ONE row (the AssistanceRequest) by primary
 * key. It must not grow to lock additional tables in this method — any
 * new transaction that needs cross-table locks should sort lock targets
 * by PK ascending to match the project-wide convention. See the deadlock
 * prevention notes in /docs (or the project README's "Transactions"
 * section) before adding more locks here.
 *
 * `attempts: 3` retries on the rare serialization failure that can
 * occur when another admin's transaction touched the same row in the
 * same instant (e.g. two simultaneous Pick Up clicks). The transition
 * guard inside the closure still catches the "already claimed" case
 * and surfaces a friendly DomainException — the retry only kicks in
 * for transient lock contention, not application-level conflicts.
 */
class StartAssistanceRequestReviewAction
{
    public function execute(
        string $assistanceRequestId,
        string $municipalId,
        string $reviewerId,
    ): AssistanceRequest {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $reviewerId) {
            // Row-lock the target so concurrent claims serialize.
            $request = AssistanceRequest::query()
                ->whereKey($assistanceRequestId)
                ->lockForUpdate()
                ->firstOrFail();

            // Tenant guard — reject cross-LGU claims. 403 (not 404) here
            // because the caller is an authenticated admin performing a
            // deliberate mutation, not just probing a URL.
            if ($request->municipal_id !== $municipalId) {
                throw new AuthorizationException(
                    'You may only review requests from your own municipality.'
                );
            }

            // Transition guard — the enum decides what's legal.
            // status is cast to AssistanceStatus by the model, so $request->status
            // is already an enum instance here.
            if (!$request->status->canTransitionTo(AssistanceStatus::UnderReview)) {
                throw new \DomainException(
                    $this->buildTransitionFailureMessage($request),
                );
            }

            $request->update([
                'status' => AssistanceStatus::UnderReview,
                'reviewed_by_user_id' => $reviewerId,
                'reviewed_at' => now(),
            ]);

            return $request->fresh();
        }, attempts: 3);
    }

    /**
     * Produce a message that's useful both to the admin UI flash banner and
     * to anyone reading the audit log. The two most likely real-world causes
     * are "someone beat me to it" (already under review) and "case is
     * already decided" (approved / rejected / released / cancelled).
     */
    private function buildTransitionFailureMessage(AssistanceRequest $request): string
    {
        return match ($request->status) {
            AssistanceStatus::UnderReview => 'This case has already been picked up by another reviewer.',
            AssistanceStatus::Approved,
            AssistanceStatus::Released,
            AssistanceStatus::Rejected,
            AssistanceStatus::Cancelled => sprintf(
                'This case is already %s and can no longer be moved into review.',
                $request->status->label(),
            ),
            default => 'This case cannot be moved into review from its current state.',
        };
    }
}
