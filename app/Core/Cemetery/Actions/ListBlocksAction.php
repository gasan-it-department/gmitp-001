<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Models\Block;
use Illuminate\Support\Collection;

/**
 * Lists active blocks for the current municipality, eager-loaded with section
 * so the plot-create dropdown can render "{section} / {block}" labels without
 * an N+1. Direct Eloquent — no repository.
 *
 * Inactive/maintenance blocks are excluded so the admin cannot register new
 * plots into a block flagged for retirement.
 */
class ListBlocksAction
{
    public function execute(string $municipalId): Collection
    {
        return Block::with('section')
            ->where('municipal_id', $municipalId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }
}
