<?php

namespace App\External\Web\Controllers\Event\Admin;

use App\Core\Event\Actions\GetEventDetailsAction;
use App\External\Api\Resources\Event\Admin\AdminEventDetailsResource;
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
            includeAudit: true,
        );

        return Inertia::render('Event/Admin/Show', [
            'event' => (new AdminEventDetailsResource($model))->resolve(),
        ]);
    }
}
