<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\RejectAssistanceRequestRequest;

/**
 * Pure-primitives DTO for the "Reject Assistance Request" workflow event.
 *
 * Carries ONLY scalars — no models, no queries. The action resolves the
 * AssistanceRequest from the ID and runs the tenant + transition gates.
 *
 * `rejectedByUserName` is captured here (resolved in the controller from
 * the authenticated user) so the action doesn't need to look the user up
 * again just to stamp the remarks footer. Symmetric to how approve also
 * needs the human name for the COA-readable trail.
 */
readonly class RejectAssistanceRequestDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $rejectedByUserId,
        public string $rejectedByUserName,
        public string $remarks,
    ) {
    }

    public static function fromRequest(
        RejectAssistanceRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $userId,
        string $userName,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            rejectedByUserId: $userId,
            rejectedByUserName: $userName,
            remarks: (string) $request->validated('remarks'),
        );
    }
}
