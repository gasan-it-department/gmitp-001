<?php

namespace App\External\Web\Controllers\Event\Client;

use App\Core\Event\Actions\GetEventDetailsAction;
use App\External\Api\Resources\Event\Client\ClientEventDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowEventController extends Controller
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

        if (! $model->is_published) {
            abort(404);
        }

        return Inertia::render('Event/Client/Show', [
            'event' => (new ClientEventDetailsResource($model))->resolve(),
        ]);
    }
}
