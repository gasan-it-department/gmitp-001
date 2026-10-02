<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Database\Eloquent\Collection;

/**
 * Finds beneficiaries in a municipality that share a person's first name, last
 * name, and birth date (case-insensitive). Online profile setup uses these
 * matches for an admin follow-up flag. Admin registration uses the broader
 * CheckBeneficiaryRegistrationIdentityAction instead.
 *
 * Tenant scope lives on the household. `excludeBeneficiaryId` lets the online
 * caller skip the row it just inserted.
 */
class FindPotentialDuplicateBeneficiariesAction
{
    /**
     * @return Collection<int, Beneficiary>
     */
    public function execute(
        string $firstName,
        string $lastName,
        string $birthDate,
        string $municipalId,
        ?string $excludeBeneficiaryId = null,
    ): Collection {
        return Beneficiary::query()
            ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId))
            ->whereRaw('LOWER(first_name) = ?', [mb_strtolower($firstName)])
            ->whereRaw('LOWER(last_name) = ?', [mb_strtolower($lastName)])
            ->whereDate('birth_date', $birthDate)
            ->when($excludeBeneficiaryId !== null, fn ($q) => $q->whereKeyNot($excludeBeneficiaryId))
            ->with(['household', 'user:id,email'])
            ->get();
    }
}
