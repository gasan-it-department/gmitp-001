<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Models\Beneficiary;

/**
 * Resolves the full identity GROUP a beneficiary belongs to after duplicate
 * merges: the canonical record plus every duplicate merged into it.
 *
 * This is the single reuse point that makes the non-destructive merge work.
 * Eligibility, assistance history, and the admin profile all read across the
 * returned id sets instead of a single beneficiary_id — so two accounts that
 * were merged share ONE cooldown clock and ONE history, with zero frozen rows
 * mutated.
 *
 * Group membership is intentionally ONE LEVEL deep: a duplicate points straight
 * at its canonical (MergeBeneficiaryAction forbids merging an already-merged
 * record or merging into a duplicate), so we never have to walk a chain.
 *
 * Pure read. Tenant scoping is the caller's job — every caller here has already
 * loaded/guarded the beneficiary against app('municipal_id').
 */
class ResolveBeneficiaryIdentityGroupAction
{
    public function execute(Beneficiary $beneficiary): BeneficiaryIdentityGroup
    {
        // Resolve UP to the canonical first. If this row is itself a duplicate,
        // its canonical is the merge target; otherwise it IS the canonical.
        $canonical = $beneficiary->merged_into_beneficiary_id !== null
            ? ($beneficiary->mergedInto()->first() ?? $beneficiary)
            : $beneficiary;

        // Canonical + all duplicates merged into it = the whole group.
        $duplicates = $canonical->mergedDuplicates()->get();
        $members = $duplicates->push($canonical);

        return new BeneficiaryIdentityGroup(
            canonical: $canonical,
            beneficiaryIds: $members->pluck('id')->unique()->values()->all(),
            householdIds: $members
                ->pluck('household_id')
                ->filter()      // drop nulls defensively
                ->unique()
                ->values()
                ->all(),
        );
    }
}
