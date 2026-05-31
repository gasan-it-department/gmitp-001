<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Models\Announcement;

class GetAnnouncementDetailsAction
{
    /**
     * Fetch a single announcement, strictly tenant-scoped.
     *
     * Uses whereKey + firstOrFail (NOT findOrFail) so a cross-tenant ID 404s
     * instead of leaking record existence.
     */
    public function execute(string $municipalId, string $id, bool $includeAudit = false): Announcement
    {
        $relations = ['media', 'user:id,first_name,last_name'];

        if ($includeAudit) {
            $relations[] = 'activities';
        }

        return Announcement::query()
            ->with($relations)
            ->where('municipal_id', $municipalId)
            ->whereKey($id)
            ->firstOrFail();
    }
}
