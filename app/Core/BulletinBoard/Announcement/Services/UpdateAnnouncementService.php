<?php

namespace App\Core\BulletinBoard\Announcement\Services;

use App\Core\BulletinBoard\Announcement\Models\Announcement;

class UpdateAnnouncementService
{
    /**
     * Update an existing announcement record.
     *
     * @param string $id
     * @param array $data
     * @return Announcement
     */
    public function execute(string $id, array $data): Announcement
    {
        $announcement = Announcement::findOrFail($id);

        $announcement->update([
            'title' => $data['title'] ?? $announcement->title,
            'message' => $data['message'] ?? $announcement->message,
            'is_published' => $data['is_published'] ?? $announcement->is_published,
        ]);

        return $announcement;
    }
}
