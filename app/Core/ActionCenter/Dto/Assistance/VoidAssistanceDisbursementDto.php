<?php

namespace App\Core\ActionCenter\Dto\Assistance;

final readonly class VoidAssistanceDisbursementDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $disbursementId,
        public string $municipalId,
        public string $actorId,
        public string $reason,
    ) {}
}
