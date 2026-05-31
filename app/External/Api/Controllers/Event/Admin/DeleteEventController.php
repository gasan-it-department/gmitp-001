<?php

namespace App\External\Api\Controllers\Event\Admin;

use App\Core\Event\Actions\DeleteEventAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeleteEventController extends Controller
{
    public function __construct(
        private DeleteEventAction $deleteEvent,
    ) {
    }

    public function __invoke(string $event): RedirectResponse
    {
        $this->deleteEvent->execute($event, app('municipal_id'));

        return back()->with('success', 'Event deleted.');
    }
}
