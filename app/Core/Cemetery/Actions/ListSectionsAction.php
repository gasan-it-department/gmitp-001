<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Models\Section;
use Illuminate\Support\Collection;

/**
 * Lists cemetery sections for the current municipality (direct Eloquent — no
 * repository). Used to populate the section dropdown on the plot screens.
 */
class ListSectionsAction
{
    public function execute(string $municipalId): Collection
    {
        return Section::where('municipal_id', $municipalId)
            ->orderBy('name')
            ->get();
    }
}
