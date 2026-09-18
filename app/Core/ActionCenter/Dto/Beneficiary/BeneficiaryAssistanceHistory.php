<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use Illuminate\Support\Collection;

final readonly class BeneficiaryAssistanceHistory
{
    /**
     * @param  Collection<int, BeneficiaryAssistanceHistoryEntry>  $entries
     */
    public function __construct(
        public Collection $entries,
        public int $receivedRequestCount,
        public int $releasedReceivedCount,
        public float $totalReleasedReceivedAmount,
    ) {}
}
