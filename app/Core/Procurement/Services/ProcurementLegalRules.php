<?php

namespace App\Core\Procurement\Services;

use Carbon\Carbon;
class ProcurementLegalRules
{

    public const MANDATORY_PRE_BID_THRESHOLD = 1000000;
    public const MIN_DAYS_BETWEEN_PREBID_AND_CLOSING = 12;
    public function satisfiesPreBidRequirement(float $abc, bool $hasPreBidDate): bool
    {
        if ($abc >= self::MANDATORY_PRE_BID_THRESHOLD) {
            return $hasPreBidDate;
        }

        return true;
    }

    public function isTimeCompliant(Carbon $preBid, Carbon $closing): bool
    {
        if ($closing->lessThan($preBid)) {
            return false;
        }

        // 2. Normalize to Midnight (00:00:00)
        // This ensures we compare calendar days, not hours/minutes.
        $pre = $preBid->copy()->startOfDay();
        $close = $closing->copy()->startOfDay();

        // 3. Force the absolute difference (the second parameter 'true')
        // This ensures you get 22.0, not -22.0
        $diff = $close->diffInDays($pre, true);

        return $diff >= self::MIN_DAYS_BETWEEN_PREBID_AND_CLOSING;
    }

}