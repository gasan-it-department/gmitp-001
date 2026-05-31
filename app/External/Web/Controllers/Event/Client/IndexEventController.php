<?php

namespace App\External\Web\Controllers\Event\Client;

use App\Core\Event\Actions\GetClientEventsAction;
use App\External\Api\Resources\Event\Client\ClientEventListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexEventController extends Controller
{
    public function __construct(
        private GetClientEventsAction $listEvents,
    ) {
    }

    public function __invoke(): Response
    {
        $events = $this->listEvents->execute(
            municipalId: app('municipal_id'),
            perPage: 20,
        );

        return Inertia::render('Event/Client/Index', [
            'events' => ClientEventListResource::collection($events),
        ]);
    }
}
