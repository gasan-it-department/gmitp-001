<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;

/**
 * The resolved identity group for a beneficiary after duplicate merges:
 * the canonical record plus the id sets that span the whole group.
 *
 * Produced by ResolveBeneficiaryIdentityGroupAction and consumed by the
 * group-aware reads (eligibility, history). `beneficiaryIds` always contains at
 * least the canonical's own id; `householdIds` may be empty only in the
 * pathological case of a group with no household (normal records always have
 * one).
 */
final class BeneficiaryIdentityGroup
{
    /**
     * @param  list<string>  $beneficiaryIds  canonical + every merged duplicate
     * @param  list<string>  $householdIds    distinct households across the group
     */
    public function __construct(
        public readonly Beneficiary $canonical,
        public readonly array $beneficiaryIds,
        public readonly array $householdIds,
    ) {
    }
}
