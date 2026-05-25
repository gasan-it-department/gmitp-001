<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\CancelAssistanceRequestRequest;

/**
 * Pure-primitives DTO for the citizen-initiated "Cancel Assistance Request"
 * workflow event.
 *
 * Citizen-driven (not admin) — the action enforces ownership by checking
 * that the request's beneficiary.user_id matches $userId. This is the
 * critical guard distinguishing cancel from reject; without it a citizen
 * could POST cancel/{someone-else's-id} and wipe out an unrelated request.
 *
 * `reason` is nullable on purpose. Citizens cancel for many low-stakes
 * reasons (changed mind, duplicate submission, condition resolved); a
 * required textarea adds abandonment friction with no compliance value.
 * When provided, it's appended to remarks for the case record.
 */
readonly class CancelAssistanceRequestDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $userId,
        public ?string $reason,
    ) {
    }

    public static function fromRequest(
        CancelAssistanceRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $userId,
    ): self {
        $reason = $request->validated('reason');

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            userId: $userId,
            reason: is_string($reason) && trim($reason) !== '' ? trim($reason) : null,
        );
    }
}
