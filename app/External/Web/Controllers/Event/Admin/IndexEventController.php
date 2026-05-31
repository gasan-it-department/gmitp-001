<?php

namespace App\External\Web\Controllers\Event\Admin;

use App\Core\Event\Actions\GetAdminEventsAction;
use App\External\Api\Resources\Event\Admin\AdminEventListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexEventController extends Controller
{
    public function __construct(
        private GetAdminEventsAction $listEvents,
    ) {
    }

    public function __invoke(): Response
    {
        $events = $this->listEvents->execute(
            municipalId: app('municipal_id'),
            perPage: 20,
        );

        return Inertia::render('Event/Admin/Index', [
            'events' => AdminEventListResource::collection($events),
        ]);
    }
}
