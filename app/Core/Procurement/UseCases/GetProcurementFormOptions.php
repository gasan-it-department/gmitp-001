<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Models\ProcurementFundingSource;

class GetProcurementFormOptions
{
    public function execute(): array
    {
        return [
            'funding_sources' => ProcurementFundingSource::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'categories' => ProcurementCategory::toSelectOption(),
            'statuses' => ProcurementStatus::toSelectOptions(),
            'document_types' => ProcurementDocumentType::toOptionsArray(),
        ];
    }
}