<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Procurement Thresholds (R.A. 9184)
    |--------------------------------------------------------------------------
    |
    | These values represent the legal limits defined by the Government 
    | Procurement Reform Act. Changes here will reflect across the 
    | entire application.
    |
    */

    'thresholds' => [
        // Projects >= this amount require a mandatory Pre-Bid Conference
        'mandatory_pre_bid' => env('PROCUREMENT_PREBID_THRESHOLD', 1000000),

        // Example: Small Value Procurement limit (usually 1M for provinces)
        'svp_limit' => 1000000,
    ],

    'timelines' => [
        // Minimum days between Pre-bid and Closing
        'min_days_after_pre_bid' => 12,
    ],
];