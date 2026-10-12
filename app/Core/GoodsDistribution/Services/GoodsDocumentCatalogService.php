<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\ActionCenter\Models\DocumentType;
use Illuminate\Database\Eloquent\Collection;

final class GoodsDocumentCatalogService
{
    public function available(string $municipalId): Collection
    {
        return DocumentType::query()->availableToMunicipality($municipalId)->where('is_active', true)
            ->orderBy('sort_order')->orderBy('label')->get(['id', 'key', 'label', 'description']);
    }
}
