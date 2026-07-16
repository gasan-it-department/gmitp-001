<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Models\Announcement;

class GetClientAnnouncementDetailsAction
{
    public function execute(string $municipalId, string $id): Announcement
    {
        return Announcement::query()
            ->with('media')
            ->where('municipal_id', $municipalId)
            ->where('is_published', true)
            ->whereKey($id)
            ->firstOrFail();
    }
}
