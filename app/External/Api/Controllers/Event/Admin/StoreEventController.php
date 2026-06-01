<?php

namespace App\External\Api\Controllers\Event\Admin;

use App\Core\Event\Actions\StoreEventAction;
use App\Core\Event\Dto\StoreEventDto;
use App\External\Api\Request\Event\StoreEventRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreEventController extends Controller
{
    public function __construct(
        private StoreEventAction $storeEvent,
    ) {
    }

    public function __invoke(StoreEventRequest $request): RedirectResponse
    {
        $this->storeEvent->execute(
            StoreEventDto::fromRequest($request, app('municipal_id')),
        );

        return redirect()->route('event.admin.index', ['municipality' => app('current_municipality')->slug])->with('success', 'Event created.');
    }
}
