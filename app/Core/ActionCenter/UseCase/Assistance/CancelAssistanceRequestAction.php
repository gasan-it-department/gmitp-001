<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CancelAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Citizen-initiated cancellation ("withdraw my application").
 *
 * ── Why this is a separate class from reject ───────────────────────────
 * Reject is admin-driven and denial-flavored — the citizen is the subject.
 * Cancel is citizen-driven and withdrawal-flavored — the citizen is the
 * actor. The two share storage shape but have different gates and a
 * different ownership model, so they don't collapse cleanly.
 *
 * ── Lock-order contract ────────────────────────────────────────────────
 * Single lock on the target ac_assistance_requests row, same row-first
 * order as approve/reject/start-review. Concurrent admin-side actions
 * (e.g. an admin clicking "Pick Up Case" while the citizen cancels) will
 * serialize on this row.
 *
 * ── Hard gates (cheap → expensive) ─────────────────────────────────────
 *   1. Tenant match    — request belongs to the current municipality
 *   2. Ownership match — request's beneficiary.user_id == $dto->userId
 *                        (prevents citizen A from cancelling citizen B's
 *                        request by ID-guessing the route param)
 *   3. Cancellable state — current status must be Pending or UnderReview.
 *                          Approved cases ARE technically transitionable
 *                          to Cancelled per the enum, but citizen-self-
 *                          cancellation of an approved (funds committed,
 *                          cooldown written) case is intentionally
 *                          blocked. That path is reserved for a future
 *                          admin-side flow that also reverses cooldown.
 *
 * `attempts: 3` retries on the rare serialization conflict.
 */
class CancelAssistanceRequestAction
{
    /**
     * Statuses a citizen is allowed to self-cancel from. Anything outside
     * this set (Approved, Released, Rejected, Cancelled) is rejected even
     * if the enum's canTransitionTo() would otherwise permit it.
     */
    private const CITIZEN_CANCELLABLE_STATUSES = [
        AssistanceStatus::Pending,
        AssistanceStatus::UnderReview,
    ];

    public function execute(CancelAssistanceRequestDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto) {
            $request = AssistanceRequest::query()
                ->with('beneficiary:id,user_id')
                ->whereKey($dto->assistanceRequestId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTenantMatch($request, $dto->municipalId);
            $this->ensureOwnership($request, $dto->userId);
            $this->ensureCancellableState($request);

            $request->update([
                'status' => AssistanceStatus::Cancelled,
                'cancelled_by_user_id' => $dto->userId,
                'cancelled_at' => now(),
                'remarks' => $this->appendCancellationNote(
                    existing: $request->remarks,
                    reason: $dto->reason,
                ),
            ]);

            return $request->fresh();
        }, attempts: 3);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Hard gates
    // ─────────────────────────────────────────────────────────────────────

    private function ensureTenantMatch(AssistanceRequest $request, string $municipalId): void
    {
        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only cancel requests from your own municipality.',
            );
        }
    }

    /**
     * Citizen may only cancel a request they themselves filed (i.e. the
     * request's beneficiary is linked to their user account). Walk-in
     * requests (where beneficiary.user_id is NULL) are NOT citizen-
     * cancellable — those are admin-managed.
     */
    private function ensureOwnership(AssistanceRequest $request, string $userId): void
    {
        $ownerUserId = $request->beneficiary?->user_id;

        if ($ownerUserId === null || $ownerUserId !== $userId) {
            throw new AuthorizationException(
                'You may only cancel an assistance request that you filed.',
            );
        }
    }

    private function ensureCancellableState(AssistanceRequest $request): void
    {
        if (in_array($request->status, self::CITIZEN_CANCELLABLE_STATUSES, true)) {
            return;
        }

        throw new \DomainException(
            match ($request->status) {
                AssistanceStatus::Approved =>
                    'Your request has already been approved. Please contact the MSWD office to cancel it.',
                AssistanceStatus::Released =>
                    'Your assistance has already been released — it can no longer be cancelled.',
                AssistanceStatus::Rejected =>
                    'This request was already rejected, so there is nothing to cancel.',
                AssistanceStatus::Cancelled =>
                    'This request has already been cancelled.',
                default =>
                    'This request can no longer be cancelled from its current state.',
            },
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // Side effects
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Append the citizen's reason (when given) to the remarks history with
     * a CANCELLED stamp. If no reason was given, we still leave a stamp
     * line so the audit trail shows when the citizen withdrew, but with no
     * follow-up text.
     */
    private function appendCancellationNote(?string $existing, ?string $reason): string
    {
        $stamp = '[CANCELLED ' . now()->toDateTimeString() . ' by citizen]';
        $block = $reason !== null ? $stamp . "\n" . $reason : $stamp;

        return $existing
            ? rtrim($existing) . "\n\n" . $block
            : $block;
    }
}
