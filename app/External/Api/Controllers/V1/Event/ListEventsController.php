<?php

namespace App\External\Api\Controllers\V1\Event;

use App\Core\Event\Actions\GetClientEventsAction;
use App\External\Api\Resources\V1\Event\EventListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ListEventsController extends Controller
{
    public function __construct(
        private GetClientEventsAction $listEvents,
    ) {}

    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->integer('per_page', 20), 50);

        $events = $this->listEvents->execute(
            municipalId: app('municipal_id'),
            perPage: $perPage,
        );

        return EventListResource::collection($events);
    }
}
