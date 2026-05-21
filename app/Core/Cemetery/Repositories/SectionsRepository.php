<?php

namespace App\Core\Cemetery\Repositories;

use App\Core\Cemetery\Models\Section;
use Illuminate\Support\Collection;

/**
 * Read-only repository for cemetery_sections. The "create section" flow lives in
 * a separate use case; for the plot screens we only need a list of sections
 * scoped to the current municipality.
 */
class SectionsRepository
{
    public function listByMunicipality(string $municipalId): Collection
    {
        return Section::where('municipal_id', $municipalId)
            ->orderBy('name')
            ->get();
    }
}
