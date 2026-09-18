<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use Illuminate\Support\Collection;

final readonly class HouseholdAssistanceHistory
{
    /**
     * @param  Collection<int, BeneficiaryAssistanceHistoryEntry>  $entries
     */
    public function __construct(
        public Collection $entries,
        public int $requestCount,
        public int $releasedCount,
        public float $totalReleasedAmount,
    ) {}
}
