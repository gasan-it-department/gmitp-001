<?php

namespace App\External\Api\Controllers\Event\Admin;

use App\Core\Event\Actions\UpdateEventAction;
use App\Core\Event\Dto\UpdateEventDto;
use App\External\Api\Request\Event\UpdateEventRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateEventController extends Controller
{
    public function __construct(
        private UpdateEventAction $updateEvent,
    ) {
    }

    public function __invoke(UpdateEventRequest $request, string $event): RedirectResponse
    {
        $this->updateEvent->execute(
            $event,
            UpdateEventDto::fromRequest($request, app('municipal_id')),
        );

        return redirect()->route('event.admin.index', ['municipality' => app('current_municipality')->slug])->with('success', 'Event updated.');
    }
}
