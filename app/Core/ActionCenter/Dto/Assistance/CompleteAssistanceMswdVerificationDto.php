<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\CompleteAssistanceMswdVerificationRequest;

readonly class CompleteAssistanceMswdVerificationDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $actorId,
        public string $expectedFingerprint,
    ) {}

    public static function fromRequest(CompleteAssistanceMswdVerificationRequest $request, string $assistanceRequestId, string $municipalId, string $actorId): self
    {
        return new self($assistanceRequestId, $municipalId, $actorId, $request->validated('expected_fingerprint'));
    }
}
