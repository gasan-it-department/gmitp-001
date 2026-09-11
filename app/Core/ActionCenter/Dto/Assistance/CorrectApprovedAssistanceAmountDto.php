<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\CorrectApprovedAssistanceAmountRequest;

readonly class CorrectApprovedAssistanceAmountDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $correctedByUserId,
        public float $amountApproved,
        public string $reason,
    ) {}

    public static function fromRequest(
        CorrectApprovedAssistanceAmountRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $correctedByUserId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            correctedByUserId: $correctedByUserId,
            amountApproved: (float) $request->validated('amount_approved'),
            reason: trim((string) $request->validated('reason')),
        );
    }
}
