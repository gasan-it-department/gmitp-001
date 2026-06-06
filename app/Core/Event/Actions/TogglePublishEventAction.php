<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Models\Event;
use Illuminate\Support\Facades\DB;

class TogglePublishEventAction
{
    public function execute(string $id, string $municipalId): Event
    {
        return DB::transaction(function () use ($id, $municipalId) {
            $event = Event::query()
                ->where('municipal_id', $municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $event->update([
                'is_published' => ! $event->is_published,
            ]);

            return $event->fresh();
        }, attempts: 3);
    }
}
