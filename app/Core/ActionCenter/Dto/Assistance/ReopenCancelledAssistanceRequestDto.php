<?php

namespace App\Core\ActionCenter\Dto\Assistance;

final readonly class ReopenCancelledAssistanceRequestDto
{
    public function __construct(
        public string $requestId,
        public string $municipalId,
        public string $actorId,
        public string $reason,
        public string $contextToken,
        public string $operationKey,
        public bool $confirmNotReleased,
        public bool $confirmPapersInvalid,
    ) {}
}
