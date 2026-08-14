<?php

namespace App\Core\Procurement\Services;

use App\Core\Procurement\Exceptions\ProcurementDomainException;
use Carbon\Carbon;
use DateTimeInterface;

class ProcurementTimelineValidator
{
    public function validateSequence(
        DateTimeInterface|string|null $preBidDate,
        DateTimeInterface|string|null $closingDate,
        DateTimeInterface|string|null $awardDate = null,
    ): void {
        if ($closingDate === null) {
            if ($preBidDate !== null || $awardDate !== null) {
                throw new ProcurementDomainException(
                    'Timeline Error: A Closing Date is required when milestone dates are supplied.'
                );
            }

            return;
        }

        $closing = Carbon::parse($closingDate)->startOfDay();

        if ($preBidDate) {
            $preBid = Carbon::parse($preBidDate)->startOfDay();
            if ($closing->isBefore($preBid)) {
                throw new ProcurementDomainException(
                    'Timeline Error: The Closing Date cannot happen before the Pre-Bid Conference.'
                );
            }
        }

        if ($awardDate) {
            $awarded = Carbon::parse($awardDate)->startOfDay();
            if (! $awarded->isAfter($closing)) {
                throw new ProcurementDomainException(
                    'Timeline Error: The Award Date must be after the Closing Date.'
                );
            }
        }
    }
}
