<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Models\Procurement;

class GetPublishedProcurementUseCase
{
    public function execute(string $procurementId, string $municipalId): Procurement
    {
        return Procurement::query()
            ->where('municipal_id', $municipalId)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where('status', '!=', ProcurementStatus::DRAFT->value)
            ->with([
                'department:id,name',
                'fundingSource:id,name,code',
                'media',
            ])
            ->findOrFail($procurementId);
    }
}
