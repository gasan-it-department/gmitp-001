<?php

namespace App\Core\Procurement\Services;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use Carbon\Carbon;

class ProcurementTimelineValidator
{
    public function validateSequence(?string $preBidDate, string $closingDate, ?string $awardDate = null): void
    {
        $closing = Carbon::parse($closingDate)->startOfDay();

        if ($preBidDate) {
            $preBid = Carbon::parse($preBidDate)->startOfDay();
            if ($closing->isBefore($preBid)) {
                throw new ProcurementDomainException(
                    "Timeline Error: The Closing Date cannot happen before the Pre-Bid Conference."
                );
            }
        }

        if ($awardDate) {
            $awardDed = Carbon::parse($awardDate)->startOfDay();
            if ($closing->isAfter($awardDed)) {
                throw new ProcurementDomainException(
                    "Timeline Error: The Closing Date cannot be later than the Awarded Date."
                );
            }
        }
    }
}