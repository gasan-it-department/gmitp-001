<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\Models\Beneficiary;

final class GetGoodsRecipientAction
{
    public function execute(string $municipalId, string $beneficiaryId): Beneficiary
    {
        return Beneficiary::query()
            ->where('municipal_id', $municipalId)
            ->whereHas('household', fn ($query) => $query->where('municipal_id', $municipalId))
            ->with(['household.activeHead', 'household.activeMembers'])
            ->findOrFail($beneficiaryId);
    }
}
