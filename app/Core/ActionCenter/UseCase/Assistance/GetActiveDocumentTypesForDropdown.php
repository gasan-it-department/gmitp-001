<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\DocumentType;

class GetActiveDocumentTypesForDropdown
{
    public function execute()
    {
        return DocumentType::query()
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('label', 'asc')
            ->get(['id', 'label as name']);
    }
}