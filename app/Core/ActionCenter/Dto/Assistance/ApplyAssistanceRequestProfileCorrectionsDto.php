<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\ApplyAssistanceRequestProfileCorrectionsRequest;

readonly class ApplyAssistanceRequestProfileCorrectionsDto
{
    /**
     * @param  list<string>  $fields
     */
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $correctedByUserId,
        public array $fields,
        public string $reason,
        public bool $canProcessRequests,
        public bool $canCorrectRequests,
    ) {}

    public static function fromRequest(
        ApplyAssistanceRequestProfileCorrectionsRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        $actor = $request->user();

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            correctedByUserId: (string) $actor->id,
            fields: array_values($request->validated('fields')),
            reason: trim((string) $request->validated('reason')),
            canProcessRequests: $actor->can('action_center.requests.process'),
            canCorrectRequests: $actor->can('action_center.requests.correct'),
        );
    }
}
