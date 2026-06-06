<?php

namespace App\External\Web\Controllers\Event\Admin;

use App\Core\Event\Actions\GetEventDetailsAction;
use App\Core\Event\Enums\EventType;
use App\External\Api\Resources\Event\Admin\AdminEventDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EditEventController extends Controller
{
    public function __construct(
        private GetEventDetailsAction $getDetails,
    ) {
    }

    public function __invoke(string $municipality, string $event): Response
    {
        $model = $this->getDetails->execute(
            municipalId: app('municipal_id'),
            id: $event,
        );

        return Inertia::render('Event/Admin/Form', [
            'event' => (new AdminEventDetailsResource($model))->resolve(),
            'types' => EventType::toOptions(),
        ]);
    }
}
