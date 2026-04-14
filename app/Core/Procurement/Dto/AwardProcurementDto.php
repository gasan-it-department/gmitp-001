<?php

namespace App\Core\Procurement\Dto;

readonly class AwardProcurementDto
{
    public function __construct(
        public string $municipalId,
        public string $procurementId,
        public string $winnerName,
        public float $contractAmount,
        public string $awardedDate,
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
            winnerName: $validated['winning_bidder_name'],
            contractAmount: (float) $validated['contract_amount'], // Ensure it's safely cast to a float
            awardedDate: $validated['awarded_date'],
        );
    }
}