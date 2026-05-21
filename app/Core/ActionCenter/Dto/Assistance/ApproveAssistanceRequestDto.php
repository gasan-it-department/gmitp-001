<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\ApproveAssistanceRequestRequest;

/**
 * Pure-primitives DTO for the "Approve Assistance Request" workflow event.
 *
 * Carries ONLY scalar values — no models, no queries, no model relations.
 * The action layer resolves the AssistanceRequest, its AssistanceType, the
 * household members, etc. from these IDs.
 *
 * Three sources of data:
 *   • Route segment            → $assistanceRequestId
 *   • Tenant + auth context    → $municipalId, $approverId
 *   • Validated FormRequest    → $amountApproved, $approvalNotes
 */
readonly class ApproveAssistanceRequestDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $approverId,
        public float $amountApproved,
        public string $approvalNotes,
    ) {
    }

    /**
     * Build from the validated FormRequest plus context resolved by the
     * controller (route param, tenant binding, auth).
     */
    public static function fromRequest(
        ApproveAssistanceRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $approverId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            approverId: $approverId,
            amountApproved: (float) $request->validated('amount_approved'),
            approvalNotes: (string) $request->validated('approval_notes'),
        );
    }
}
