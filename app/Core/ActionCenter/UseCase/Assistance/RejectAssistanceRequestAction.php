<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\RejectAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
/**
 * Reject an assistance request that's under_review.
 *
 * Sibling to ApproveAssistanceRequestAction but much simpler:
 *   - no amount commitment
 *   - no document checks
 *   - no cooldown fan-out (rejection doesn't block future applications;
 *     only an APPROVAL writes cooldown rows)
 *
 * ── Lock-order contract ────────────────────────────────────────────────
 * Single lock on ac_assistance_requests (the target row). Same row-first
 * order as approve/start-review — concurrent admins clicking Reject and
 * Approve on the same case serialize predictably.
 *
 * ── Hard gates (cheap → expensive) ─────────────────────────────────────
 *   1. Tenant match     — request belongs to the current municipality
 *   2. Transition rule  — enum's canTransitionTo() permits the move to Rejected
 *                         (allowed from UnderReview; blocked from
 *                         Pending/Approved/Released/Rejected/Cancelled)
 *   3. Reviewer assigned — reviewed_by_user_id must NOT be null
 *
 * `attempts: 3` retries on the rare serialization conflict (two admins
 * double-clicking Reject on the same case).
 */
class RejectAssistanceRequestAction
{
    public function __construct(
        protected LockAssistanceRequestAction $lockRequest
    ) {}

    public function execute(RejectAssistanceRequestDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto) {
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId
            );

            $this->ensureTransitionAllowed($request);
            $this->ensureReviewerAssigned($request);

            $request->update([
                'status' => AssistanceStatus::Rejected,
                'rejected_by_user_id' => $dto->rejectedByUserId,
                'rejected_at' => now(),
                'remarks' => $this->appendRejectionReason(
                    existing: $request->remarks,
                    reason: $dto->remarks,
                    rejectorName: $dto->rejectedByUserName,
                ),
            ]);

            return $request->fresh();
        }, attempts: 3);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Hard gates
    // ─────────────────────────────────────────────────────────────────────

    private function ensureReviewerAssigned(AssistanceRequest $request): void
    {
        if ($request->reviewed_by_user_id === null) {
            throw new \DomainException(
                'This case has no assigned reviewer. Pick it up first before Rejecting.',
            );
        }
    }


    private function ensureTransitionAllowed(AssistanceRequest $request): void
    {
        if (!$request->status->canTransitionTo(AssistanceStatus::Rejected)) {
            throw new \DomainException(
                match ($request->status) {
                    AssistanceStatus::Approved => 'This case is already approved and can no longer be rejected.',
                    AssistanceStatus::Released => 'This case was already released and cannot be rejected.',
                    AssistanceStatus::Rejected => 'This case has already been rejected.',
                    AssistanceStatus::Cancelled => 'This case was cancelled and cannot be rejected.',
                    default => 'This case cannot be rejected from its current state.',
                },
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Side effects
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Append the rejection reason to the existing remarks with a stamp so
     * any prior case-study notes are preserved and the rejection rationale
     * is visible to anyone reading the remarks afterward (including COA).
     */
    private function appendRejectionReason(?string $existing, string $reason, string $rejectorName): string
    {
        $stamp = '[REJECTED ' . now()->toDateTimeString() . ' by ' . $rejectorName . ']';
        $block = $stamp . "\n" . $reason;

        return $existing
            ? rtrim($existing) . "\n\n" . $block
            : $block;
    }
}
