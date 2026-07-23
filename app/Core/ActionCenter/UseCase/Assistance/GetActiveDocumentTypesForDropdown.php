<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\DocumentType;

class GetActiveDocumentTypesForDropdown
{
    public function execute(string $municipalId)
    {
        return DocumentType::query()
            ->availableToMunicipality($municipalId)
            ->where('is_active', true)
            ->whereNotIn('key', ['recipient_valid_id_front', 'recipient_valid_id_back'])
            ->orderBy('sort_order', 'asc')
            ->orderBy('label', 'asc')
            ->get(['id', 'label as name']);
    }
}
