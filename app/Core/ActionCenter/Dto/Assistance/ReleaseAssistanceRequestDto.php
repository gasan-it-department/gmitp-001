<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\ReleaseAssistanceRequestRequest;

/**
 * Pure-primitives DTO for the "Mark as Released" workflow event.
 *
 * Released is the COA-immutable terminal state — once committed, the row
 * cannot be edited. Corrections require a NEW entry, never a mutation
 * (see the isTerminal() enum check that enforces this at the model layer).
 *
 * `cashierName` is resolved in the controller (from the authenticated
 * user's full_name accessor) so the action can stamp a human-readable
 * footer in remarks without a second query, symmetric to reject's pattern.
 */
readonly class ReleaseAssistanceRequestDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $cashierId,
        public string $cashierName,
        public string $releaseReferenceNumber,
        public ?string $releaseNotes,
    ) {
    }

    public static function fromRequest(
        ReleaseAssistanceRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $cashierId,
        string $cashierName,
    ): self {
        $notes = $request->validated('release_notes');

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            cashierId: $cashierId,
            cashierName: $cashierName,
            releaseReferenceNumber: trim((string) $request->validated('release_reference_number')),
            releaseNotes: is_string($notes) && trim($notes) !== '' ? trim($notes) : null,
        );
    }
}
