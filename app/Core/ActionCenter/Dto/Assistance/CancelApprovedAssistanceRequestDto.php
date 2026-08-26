<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\CancelApprovedAssistanceRequestRequest;

readonly class CancelApprovedAssistanceRequestDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $cancelledByUserId,
        public string $cancelledByUserName,
        public string $reason,
    ) {}

    public static function fromRequest(
        CancelApprovedAssistanceRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $userId,
        string $userName,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            cancelledByUserId: $userId,
            cancelledByUserName: $userName,
            reason: trim((string) $request->validated('reason')),
        );
    }
}
