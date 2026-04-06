<?php

namespace App\Core\Procurement\Dto;

use App\External\Api\Request\Procurement\OpenBiddingRequest;
use Illuminate\Http\Request;
final class OpenBiddingDto
{

    public function __construct(
        public string $procurementId,
        public string $municipalId,
        public float $abcAmount,
        public string $preBidDate,
        public string $closingDate,
        public string $referenceNumber,
    ) {
    }

    public static function fromRequest(OpenBiddingRequest $request, string $procurementId, string $municipalId): self
    {
        return new self(
            procurementId: $procurementId,
            municipalId: $municipalId,
            abcAmount: (float) $request->validated('abc_amount'),
            preBidDate: $request->validated('pre_bid_date'),
            closingDate: $request->validated('closing_date'),
            referenceNumber: $request->validated('reference_number'),
        );
    }
}