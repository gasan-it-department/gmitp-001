<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;

/**
 * Resolves the portal applicant's identity record.
 *
 * Given a portal user ID, finds the linked ac_beneficiaries row and
 * eagerly loads the household. Returns null when no record exists yet
 * (first-time user who hasn't completed profile setup).
 *
 * The controller uses the return value to decide:
 *   null              → redirect to profile setup (no beneficiary at all)
 *   no household      → redirect to profile setup (beneficiary exists but incomplete)
 *   beneficiary+household → render the page with identity data
 */
class ResolveApplicantProfileAction
{
    public function execute(string $userId): ?Beneficiary
    {
        return Beneficiary::with('household')
            ->where('user_id', $userId)
            ->first();
    }
}
