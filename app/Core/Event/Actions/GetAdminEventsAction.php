<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetAdminEventsAction
{
    public function execute(string $municipalId, int $perPage = 20): LengthAwarePaginator
    {
        return Event::query()
            ->with(['media'])
            ->where('municipal_id', $municipalId)
            ->orderBy('start_datetime')
            ->paginate($perPage);
    }
}
