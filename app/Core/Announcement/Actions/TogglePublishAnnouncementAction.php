<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Models\Announcement;
use Illuminate\Support\Facades\DB;

class TogglePublishAnnouncementAction
{
    public function execute(string $id, string $municipalId): Announcement
    {
        return DB::transaction(function () use ($id, $municipalId) {
            $announcement = Announcement::query()
                ->where('municipal_id', $municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $announcement->update([
                'is_published' => ! $announcement->is_published,
            ]);

            return $announcement->fresh();
        }, attempts: 3);
    }
}
