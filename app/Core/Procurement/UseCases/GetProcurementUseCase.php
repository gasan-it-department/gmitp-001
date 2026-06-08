<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Models\Procurement;

class GetProcurementUseCase
{
    public function execute(string $procurementId, string $municipalId)
    {
        return Procurement::where('municipal_id', $municipalId)
            ->with(['media', 'department', 'fundingSource', 'creator'])
            ->findOrFail($procurementId);
    }
}