<?php

namespace App\External\Api\Controllers\V1\Event;

use App\Core\Event\Actions\GetClientEventDetailsAction;
use App\External\Api\Resources\V1\Event\EventDetailsResource;
use App\Http\Controllers\Controller;

class ShowEventController extends Controller
{
    public function __construct(
        private GetClientEventDetailsAction $getEventDetails,
    ) {}

    public function __invoke(string $event): EventDetailsResource
    {
        $model = $this->getEventDetails->execute(
            municipalId: app('municipal_id'),
            id: $event,
        );

        return new EventDetailsResource($model);
    }
}
