<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Exceptions\AssistanceApprovalException;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use Illuminate\Support\Collection;
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
        protected LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceRequestSmsNotifier $smsNotifier,
    ) {}

    public function execute(ApproveAssistanceRequestDto $dto): AssistanceRequest
    {
        $request = DB::transaction(function () use ($dto) {
            // Lock the target row AND eager-load every relation the gates
            // / fan-out need. Loading inside the lock window means we
            // operate on the most recent committed state — no stale-read
            // risk if a prior transaction just committed.
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
                with: ['assistanceType.documents', 'media', 'onBehalfHouseholdMember'],
            );

            // Run all hard gates (cheap to expensive). Any failure aborts
            // the transaction without writing anything.
            $this->ensureTransitionAllowed($request);
            $this->ensureReviewerAssigned($request);
            $this->ensureOnBehalfMemberVerified($request);
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

        $this->smsNotifier->requestApproved($request);

        return $request;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Hard gates
    // ─────────────────────────────────────────────────────────────────────

    private function ensureTransitionAllowed(AssistanceRequest $request): void
    {
        if (! $request->status->canTransitionTo(AssistanceStatus::Approved)) {
            throw AssistanceApprovalException::invalidTransition($request->status);
        }
    }

    private function ensureReviewerAssigned(AssistanceRequest $request): void
    {
        if ($request->reviewed_by_user_id === null) {
            throw AssistanceApprovalException::noReviewerAssigned();
        }
    }

    private function ensureOnBehalfMemberVerified(AssistanceRequest $request): void
    {
        $member = $request->onBehalfHouseholdMember;

        if ($member !== null
            && $member->relationship !== 'head'
            && ! $member->is_verified_dependent) {
            throw AssistanceApprovalException::dependentNotVerified();
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
            ->filter(fn ($doc) => (bool) $doc->pivot->is_required);

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
            ->map(fn ($media) => $media->getCustomProperty('document_key'))
            ->filter()
            ->unique();

        // Report the human-readable labels ("Valid ID"), not the raw keys.
        $missing = $requiredDocs
            ->reject(fn ($doc) => $uploadedKeys->contains($doc->key))
            ->pluck('label');

        if ($missing->isNotEmpty()) {
            throw AssistanceApprovalException::missingRequiredDocuments($missing);
        }

        $this->ensureRecipientIdentityDocumentsReady($request, $requiredDocs, $uploadedKeys);
    }

    private function ensureRecipientIdentityDocumentsReady(
        AssistanceRequest $request,
        Collection $requiredDocs,
        Collection $uploadedKeys,
    ): void {
        if ($request->on_behalf_household_member_id === null) {
            return;
        }

        $requiresFilerId = $requiredDocs->contains(
            fn ($document) => in_array($document->key, ['valid_id_front', 'valid_id_back'], true),
        );

        if (! $requiresFilerId) {
            return;
        }

        $exception = $request->recipient_id_exception;
        $hasValidUnavailableReason = $exception === 'no_government_id'
            && filled($request->recipient_id_exception_reason)
            && mb_strlen(trim($request->recipient_id_exception_reason)) >= 10;

        if ($request->assistanceType->slug === 'burial'
            || in_array($exception, ['minor', 'deceased'], true)
            || $hasValidUnavailableReason) {
            return;
        }

        $missing = collect([
            'recipient_valid_id_front' => 'Assisted Person Valid Government ID - Front',
            'recipient_valid_id_back' => 'Assisted Person Valid Government ID - Back',
        ])
            ->reject(fn ($label, $key) => $uploadedKeys->contains($key))
            ->values();

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

        $stamp = '[APPROVED '.now()->toDateTimeString().' by '.$name.']';
        $block = $stamp."\n".$notes;

        return $existing
            ? rtrim($existing)."\n\n".$block
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
            // For an INDEPENDENT, on-behalf-of-deceased program (Burial) the
            // cooldown is keyed to the deceased (the on-behalf household member)
            // so a DIFFERENT death in the household within the window is NOT
            // blocked. Standard programs leave this null — they cool down the
            // filer (per_beneficiary) or the whole household (per_household).
            'household_member_id' => $type->is_independent
                ? $request->on_behalf_household_member_id
                : null,
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
                ->where(function ($query) {
                    $query->where('relationship', 'head')
                        ->orWhere('is_verified_dependent', true);
                })
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
