<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Exceptions\AssistanceApprovalException;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Approve a request that's under_review, commit the amount, and write the
 * cooldown rows that block future applications from this beneficiary /
 * household per the AssistanceType's scope rules.
 *
 * ── Lock-order contract ────────────────────────────────────────────────
 * Locks in this order, all inside one DB transaction:
 *   1. ac_assistance_requests  (the target row, lockForUpdate)
 *   2. ac_beneficiary_cooldowns (inserts only — no pre-existing rows to lock)
 *   3. ac_household_members    (read-only loop for per_household fan-out)
 *
 * If new locks are ever added, append them AFTER the request-row lock —
 * never before — so concurrent approve / pickup / cancel calls all
 * serialize on the same row first.
 *
 * `attempts: 3` retries on the rare serialization conflict between two
 * admins double-clicking Approve on the same case.
 *
 * ── Hard gates evaluated in order (cheap → expensive) ──────────────────
 *   1. Tenant match               — request belongs to current municipality
 *   2. Transition rule            — enum's canTransitionTo() says under_review → approved
 *   3. Reviewer assigned          — reviewed_by_user_id must NOT be null
 *   4. Amount within type limits  — min_amount ≤ amount ≤ max_amount
 *   5. Required documents ready   — every is_required document type has an upload
 *
 * Future doc verification (when added) becomes ONE method extension on
 * ensureRequiredDocumentsReady() — see the inline comment there.
 */
class ApproveAssistanceRequestAction
{
    public function __construct(
        protected LockAssistanceRequestAction $lockRequest
    ) {}

    public function execute(ApproveAssistanceRequestDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto) {
            // Lock the target row AND eager-load every relation the gates
            // / fan-out need. Loading inside the lock window means we
            // operate on the most recent committed state — no stale-read
            // risk if a prior transaction just committed.
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
                with: ['assistanceType.documents', 'media'],
            );

            // Run all hard gates (cheap to expensive). Any failure aborts
            // the transaction without writing anything.
            $this->ensureTransitionAllowed($request);
            $this->ensureReviewerAssigned($request);
            $this->ensureAmountWithinLimits($request, $dto->amountApproved);
            $this->ensureRequiredDocumentsReady($request);

            // Commit the approval to the request row. Activity log captures
            // status / amount_approved / approved_by_user_id changes
            // automatically via spatie LogsActivity on AssistanceRequest.
            $request->update([
                'status' => AssistanceStatus::Approved,
                'amount_approved' => $dto->amountApproved,
                'approved_by_user_id' => $dto->approverId,
                'approved_at' => now(),
                'remarks' => $this->appendApprovalNotes(
                    existing: $request->remarks,
                    notes: $dto->approvalNotes,
                    approverId: $dto->approverId,
                ),
            ]);
            // Write the cooldown row(s). Behavior depends on the
            // AssistanceType's cooldown_scope / cooldown_type.
            $this->writeCooldowns($request);

            return $request->fresh();
        }, attempts: 3);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Hard gates
    // ─────────────────────────────────────────────────────────────────────

    private function ensureTransitionAllowed(AssistanceRequest $request): void
    {
        if (!$request->status->canTransitionTo(AssistanceStatus::Approved)) {
            throw AssistanceApprovalException::invalidTransition($request->status);
        }
    }

    private function ensureReviewerAssigned(AssistanceRequest $request): void
    {
        if ($request->reviewed_by_user_id === null) {
            throw AssistanceApprovalException::noReviewerAssigned();
        }
    }

    private function ensureAmountWithinLimits(AssistanceRequest $request, float $amount): void
    {
        $type = $request->assistanceType;

        if ($type->min_amount !== null && $amount < (float) $type->min_amount) {
            throw AssistanceApprovalException::amountBelowMinimum((float) $type->min_amount);
        }

        if ($type->max_amount !== null && $amount > (float) $type->max_amount) {
            throw AssistanceApprovalException::amountAboveMaximum((float) $type->max_amount);
        }
    }

    /**
     * Verify every is_required document type for this AssistanceType has at
     * least one upload on the request's Spatie media collection.
     *
     * ── Future extension: per-document verification ───────────────────────
     * When the admin-side "mark document verified" workflow is added, this
     * method gains a second check after the uploaded-presence check:
     *
     *   foreach ($request->media as $media) {
     *       if ($requiredKeys->contains($media->getCustomProperty('document_key'))
     *           && empty($media->custom_properties['verified_at'])) {
     *           throw AssistanceApprovalException::documentNotVerified(...);
     *       }
     *   }
     *
     * Today's "uploaded" check still applies — the verification check just
     * stacks on top. No other Approve code changes needed when that's added.
     */
    private function ensureRequiredDocumentsReady(AssistanceRequest $request): void
    {
        $requiredDocs = $request->assistanceType->documents
            ->filter(fn($doc) => (bool) $doc->pivot->is_required);

        if ($requiredDocs->isEmpty()) {
            return;
        }

        // Every upload lives in the single "documents" media collection — the
        // slot it satisfies is stored in the `document_key` custom property,
        // NOT the collection name (which is always literally "documents").
        // Plucking collection_name made every required slot look unmet, so
        // EVERY approval was blocked even when all scans were attached. Read
        // the slot keys back from the custom property instead.
        $uploadedKeys = $request->media
            ->map(fn($media) => $media->getCustomProperty('document_key'))
            ->filter()
            ->unique();

        // Report the human-readable labels ("Valid ID"), not the raw keys.
        $missing = $requiredDocs
            ->reject(fn($doc) => $uploadedKeys->contains($doc->key))
            ->pluck('label');

        if ($missing->isNotEmpty()) {
            throw AssistanceApprovalException::missingRequiredDocuments($missing);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Side effects
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Append the approver's notes to the existing remarks with a separator
     * and a footer line identifying who approved. Uses a human-readable name
     * so COA auditors can read the trail without decoding ULIDs.
     */
    private function appendApprovalNotes(?string $existing, string $notes, string $approverId): string
    {
        // Single PK lookup — cheap, already inside the DB transaction.
        $user = \App\Core\Users\Models\User::find($approverId);
        $name = $user
            ? (trim("{$user->first_name} {$user->last_name}") ?: ($user->user_name ?? $approverId))
            : $approverId;

        $stamp = '[APPROVED ' . now()->toDateTimeString() . ' by ' . $name . ']';
        $block = $stamp . "\n" . $notes;

        return $existing
            ? rtrim($existing) . "\n\n" . $block
            : $block;
    }

    /**
     * Write the cooldown row(s) per the AssistanceType's scope rules.
     *
     *   cooldown_type = 'one_time'       → cooldown_expires_at = NULL (permanent block)
     *   cooldown_type = 'per_request'    → cooldown_expires_at = now + cooldown_months
     *
     *   cooldown_scope = 'per_beneficiary' → 1 row for the requesting beneficiary
     *   cooldown_scope = 'per_household'   → 1 row per ACTIVE registered household
     *                                         member (rows where beneficiary_id is set).
     *                                         Unregistered members are caught at
     *                                         eligibility-check time via the
     *                                         household_id index on the rows we DO
     *                                         write (every fan-out row shares the
     *                                         same household_id).
     */
    private function writeCooldowns(AssistanceRequest $request): void
    {
        $type = $request->assistanceType;

        $expiresAt = $type->cooldown_type === 'one_time'
            ? null
            : now()->addMonths((int) $type->cooldown_months);

        $base = [
            'assistance_type_id' => $request->assistance_type_id,
            'assistance_request_id' => $request->id,
            'household_id' => $request->household_id,
            'cooldown_starts_at' => now(),
            'cooldown_expires_at' => $expiresAt,
        ];

        if ($type->cooldown_scope === 'per_household') {
            // Fan out: one row per active registered household member.
            // Ordered by PK ascending to match the project-wide
            // lock-order contract — concurrent fan-outs for different
            // households serialize predictably.
            $members = HouseholdMember::query()
                ->where('household_id', $request->household_id)
                ->where('is_active', true)
                ->whereNotNull('beneficiary_id')
                ->orderBy('id')
                ->get(['id', 'beneficiary_id']);

            foreach ($members as $member) {
                BeneficiaryCooldown::create(array_merge($base, [
                    'beneficiary_id' => $member->beneficiary_id,
                ]));
            }

            return;
        }

        // per_beneficiary scope: just the one row for the requesting beneficiary.
        BeneficiaryCooldown::create(array_merge($base, [
            'beneficiary_id' => $request->beneficiary_id,
        ]));
    }
}
