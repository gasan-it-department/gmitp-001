<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\ReassignAssistanceMswdReviewerRequest;

readonly class ReassignAssistanceMswdReviewerDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $actorId,
        public string $reviewerId,
        public string $reason,
    ) {}

    public static function fromRequest(ReassignAssistanceMswdReviewerRequest $request, string $assistanceRequestId, string $municipalId, string $actorId): self
    {
        return new self(
            $assistanceRequestId,
            $municipalId,
            $actorId,
            $request->validated('reviewer_id'),
            $request->validated('reason'),
        );
    }
}
