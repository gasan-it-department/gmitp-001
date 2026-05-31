<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Models\Event;
use Illuminate\Support\Facades\DB;

class DeleteEventAction
{
    public function execute(string $id, string $municipalId): void
    {
        DB::transaction(function () use ($id, $municipalId) {
            $event = Event::query()
                ->where('municipal_id', $municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $event->delete();
        }, attempts: 3);
    }
}
