<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Models\Announcement;
use Illuminate\Support\Facades\DB;

class DeleteAnnouncementAction
{
    public function execute(string $id, string $municipalId): void
    {
        DB::transaction(function () use ($id, $municipalId) {
            $announcement = Announcement::query()
                ->where('municipal_id', $municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $announcement->delete();
        }, attempts: 3);
    }
}
