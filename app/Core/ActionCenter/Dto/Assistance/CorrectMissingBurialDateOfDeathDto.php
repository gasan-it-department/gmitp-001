<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\CorrectMissingBurialDateOfDeathRequest;

/**
 * Primitive input for the one-time legacy burial correction workflow.
 */
readonly class CorrectMissingBurialDateOfDeathDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public ?string $municipalCode,
        public string $correctedByUserId,
        public string $dateOfDeath,
        public string $reason,
    ) {
    }

    public static function fromRequest(
        CorrectMissingBurialDateOfDeathRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        ?string $municipalCode,
        string $correctedByUserId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            municipalCode: $municipalCode,
            correctedByUserId: $correctedByUserId,
            dateOfDeath: trim((string) $request->validated('date_of_death')),
            reason: trim((string) $request->validated('reason')),
        );
    }
}
