<?php

namespace App\Core\Announcement\Actions;

use App\Core\Announcement\Models\Announcement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetClientAnnouncementsAction
{
    public function execute(string $municipalId, int $perPage = 20): LengthAwarePaginator
    {
        return Announcement::query()
            ->with(['media'])
            ->where('municipal_id', $municipalId)
            ->where('is_published', true)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
