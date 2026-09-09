<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\CorrectAssistanceRequestFilerNameRequest;

readonly class CorrectAssistanceRequestFilerNameDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $correctedByUserId,
        public string $reason,
        public bool $canProcessRequests,
        public bool $canCorrectRequests,
    ) {}

    public static function fromRequest(
        CorrectAssistanceRequestFilerNameRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        $actor = $request->user();

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            correctedByUserId: (string) $actor->id,
            reason: trim((string) $request->validated('reason')),
            canProcessRequests: $actor->can('action_center.requests.process'),
            canCorrectRequests: $actor->can('action_center.requests.correct'),
        );
    }
}
