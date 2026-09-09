<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AssistanceMswdReasonDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $actorId,
        public string $reason,
    ) {}
}
