<?php

namespace App\Core\Procurement\Dto;

readonly class CancelProcurementDto
{
    public function __construct(
        public string $municipalId,
        public string $procurementId,
        public string $reason,
    ) {}

    public static function fromRequest(array $validated, string $procurementId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            procurementId: $procurementId,
            reason: trim($validated['cancellation_reason']),
        );
    }
}
