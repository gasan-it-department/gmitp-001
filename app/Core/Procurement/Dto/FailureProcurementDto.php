<?php

namespace App\Core\Procurement\Dto;

readonly class FailureProcurementDto
{
    public function __construct(
        public string $municipalId,
        public string $procurementId,
        public string $reason,
        public string $failedDate,
    ) {
    }

    /**
     * Factory method to cleanly build the DTO from the Controller's validated array.
     */
    public static function fromRequest(array $validated, string $procurementId): self
    {
        return new self(
            municipalId: app('municipal_id'), // Pulling from your app context
            procurementId: $procurementId,
            reason: $validated['failure_reason'],
            failedDate: $validated['failed_date'],
        );
    }
}