<?php

namespace App\External\Web\Controllers\Announcement\Client;

use App\Core\Announcement\Actions\GetAnnouncementDetailsAction;
use App\External\Api\Resources\Announcement\ClientAnnouncementDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowAnnouncementController extends Controller
{
    public function __construct(
        private GetAnnouncementDetailsAction $getDetails,
    ) {
    }

    public function __invoke(string $municipality, string $announcement): Response
    {
        $model = $this->getDetails->execute(
            municipalId: app('municipal_id'),
            id: $announcement,
        );

        if (! $model->is_published) {
            abort(404);
        }

        return Inertia::render('Announcement/Client/Show', [
            'announcement' => (new ClientAnnouncementDetailsResource($model))->resolve(),
        ]);
    }
}
