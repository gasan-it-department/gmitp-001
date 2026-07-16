<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Models\Event;

class GetClientEventDetailsAction
{
    public function execute(string $municipalId, string $id): Event
    {
        return Event::query()
            ->with('media')
            ->where('municipal_id', $municipalId)
            ->where('is_published', true)
            ->whereKey($id)
            ->firstOrFail();
    }
}
