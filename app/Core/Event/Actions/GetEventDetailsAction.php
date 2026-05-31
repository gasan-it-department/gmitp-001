<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Models\Event;

class GetEventDetailsAction
{
    /**
     * Fetch a single event, strictly tenant-scoped.
     *
     * Uses whereKey + firstOrFail (NOT findOrFail) so a cross-tenant ID 404s
     * instead of leaking record existence.
     */
    public function execute(string $municipalId, string $id, bool $includeAudit = false): Event
    {
        $relations = ['media'];

        if ($includeAudit) {
            $relations[] = 'activities';
        }

        return Event::query()
            ->with($relations)
            ->where('municipal_id', $municipalId)
            ->whereKey($id)
            ->firstOrFail();
    }
}
