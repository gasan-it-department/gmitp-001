<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReleaseAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Mark a request as RELEASED — the cashier event recording that physical
 * funds / goods have been handed to the recipient.
 *
 * ── Why this is the most consequential workflow action ────────────────
 * Released is the COA-immutable terminal state. Once this commit lands,
 * the row is financially frozen — no edits, no re-runs, no status walks
 * away from this state (enforced by AssistanceStatus::isTerminal). Any
 * future correction has to be a NEW entry that links back to this one,
 * never a mutation of this row.
 *
 * ── Lock-order contract ────────────────────────────────────────────────
 * Single lock on ac_assistance_requests (the target row). Same row-first
 * order as approve/reject/cancel/start-review — concurrent admin actions
 * serialize predictably on the row PK.
 *
 * ── Hard gates (cheap → expensive) ─────────────────────────────────────
 *   1. Tenant match    — request belongs to the current municipality
 *   2. Transition rule — canTransitionTo(Released) (only valid from Approved)
 *   3. Amount integrity — amount_approved must not be null (defensive
 *                         against manually-edited rows; under normal flow
 *                         Approved guarantees a non-null amount)
 *   4. Reference uniqueness — release_reference_number not already used
 *                              by another request in this municipality.
 *                              The DB unique index is the source of truth;
 *                              this pre-check exists to throw a friendly
 *                              DomainException instead of a raw
 *                              QueryException when the OR number collides.
 *
 * ── No cooldown writes ─────────────────────────────────────────────────
 * The cooldown rows were already written at approval time. Release does
 * NOT fan out anything new — it only marks the physical disbursement.
 *
 * `attempts: 3` retries on the rare serialization conflict between two
 * cashiers clicking Release on the same case (which itself shouldn't
 * happen, but the safety net is cheap).
 */
class ReleaseAssistanceRequestAction
{
    public function execute(ReleaseAssistanceRequestDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto) {
            $request = AssistanceRequest::query()
                ->whereKey($dto->assistanceRequestId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTenantMatch($request, $dto->municipalId);
            $this->ensureTransitionAllowed($request);
            $this->ensureAmountApproved($request);
            $this->ensureReferenceNumberUnique($request, $dto->releaseReferenceNumber);

            $request->update([
                'status' => AssistanceStatus::Released,
                'released_by_user_id' => $dto->cashierId,
                'released_at' => $dto->releasedAt,
                'release_reference_number' => $dto->releaseReferenceNumber,
                'remarks' => $this->appendReleaseNote(
                    existing: $request->remarks,
                    referenceNumber: $dto->releaseReferenceNumber,
                    releasedAt: $dto->releasedAt->toDateString(),
                    notes: $dto->releaseNotes,
                    cashierName: $dto->cashierName,
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
                'You may only release requests from your own municipality.',
            );
        }
    }

    private function ensureTransitionAllowed(AssistanceRequest $request): void
    {
        if (!$request->status->canTransitionTo(AssistanceStatus::Released)) {
            throw new \DomainException(
                match ($request->status) {
                    AssistanceStatus::Pending     => 'This case has not been approved yet — it cannot be released.',
                    AssistanceStatus::UnderReview => 'This case is still under review — it must be approved before release.',
                    AssistanceStatus::Released    => 'This case has already been released.',
                    AssistanceStatus::Rejected    => 'This case was rejected and cannot be released.',
                    AssistanceStatus::Cancelled   => 'This case was cancelled and cannot be released.',
                    default => 'This case cannot be released from its current state.',
                },
            );
        }
    }

    /**
     * Defensive guard: an Approved row should always have amount_approved
     * set, but a manually-edited DB row could violate that invariant.
     * Failing loud here is better than releasing a NULL-amount payout.
     */
    private function ensureAmountApproved(AssistanceRequest $request): void
    {
        if ($request->amount_approved === null) {
            throw new \DomainException(
                'This case has no approved amount on file. Re-approve it before release.',
            );
        }
    }

    /**
     * Check that no other request in the same municipality already used
     * this OR / voucher number. The composite unique index is the real
     * enforcement — this query just lets us return a user-friendly message
     * instead of letting the cashier see a Postgres unique-violation page.
     */
    private function ensureReferenceNumberUnique(AssistanceRequest $request, string $referenceNumber): void
    {
        $collision = AssistanceRequest::query()
            ->where('municipal_id', $request->municipal_id)
            ->where('release_reference_number', $referenceNumber)
            ->where('id', '!=', $request->id)
            ->exists();

        if ($collision) {
            throw new \DomainException(sprintf(
                'Reference number "%s" is already used by another released case. Double-check the physical release reference.',
                $referenceNumber,
            ));
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Side effects
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Append the release event to remarks with a stamp that includes the
     * cashier's name, actual release date, and reference number on the same
     * line. The activity log timestamp still records when the release was
     * encoded in the system.
     */
    private function appendReleaseNote(
        ?string $existing,
        string $referenceNumber,
        string $releasedAt,
        ?string $notes,
        string $cashierName,
    ): string {
        $stamp = sprintf(
            '[RELEASED %s | Encoded %s by %s | Ref: %s]',
            $releasedAt,
            now()->toDateTimeString(),
            $cashierName,
            $referenceNumber,
        );

        $block = $notes !== null ? $stamp . "\n" . $notes : $stamp;

        return $existing
            ? rtrim($existing) . "\n\n" . $block
            : $block;
    }
}
