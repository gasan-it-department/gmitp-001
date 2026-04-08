<?php

namespace App\Core\Procurement\Dto;

use App\External\Api\Request\Procurement\OpenBiddingRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;
final class OpenBiddingDto
{

    public function __construct(
        public string $procurementId,
        public string $municipalId,
        public float $abcAmount,
        public ?Carbon $preBidDate,
        public Carbon $closingDate,
        public string $referenceNumber,
    ) {
    }

    public static function fromRequest(OpenBiddingRequest $request, string $procurementId, string $municipalId): self
    {
        return new self(
            procurementId: $procurementId,
            municipalId: $municipalId,
            abcAmount: (float) $request->validated('abc_amount'),
            preBidDate: $request->validated('pre_bid_date')
            ? Carbon::parse($request->validated('pre_bid_date'))
            : null,
            closingDate: Carbon::parse($request->validated('closing_date')),
            referenceNumber: $request->validated('reference_number'),
        );
    }
}