<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Models\MunicipalityHotline;
use Illuminate\Database\Eloquent\Collection;

class GetAdminHotlinesAction
{
    public function execute(string $municipalId): Collection
    {
        return MunicipalityHotline::query()
            ->where('municipal_id', $municipalId)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }
}
