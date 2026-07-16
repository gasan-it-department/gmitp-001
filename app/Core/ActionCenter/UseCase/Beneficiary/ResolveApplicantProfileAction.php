<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;

/**
 * Resolves the portal applicant's identity record FOR THE CURRENT MUNICIPALITY.
 *
 * A citizen's login is global but they hold one beneficiary record per LGU, so
 * resolution is scoped by municipal_id: the Gasan portal resolves their Gasan
 * record, the Boac portal their Boac record. Returns null when no record exists
 * in THIS municipality yet — which correctly routes a citizen who registered
 * elsewhere into profile setup here, instead of handing them their other-LGU
 * record (which the tenant guard would then reject).
 *
 * The controller uses the return value to decide:
 *   null              → redirect to profile setup (no beneficiary in this LGU)
 *   no household      → redirect to profile setup (beneficiary exists but incomplete)
 *   beneficiary+household → render the page with identity data
 */
class ResolveApplicantProfileAction
{
    public function execute(string $userId, string $municipalId): ?Beneficiary
    {
        return Beneficiary::with('household')
            ->where('user_id', $userId)
            ->where('municipal_id', $municipalId)
            ->first();
    }
}
