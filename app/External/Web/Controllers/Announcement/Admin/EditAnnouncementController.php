<?php

namespace App\External\Web\Controllers\Announcement\Admin;

use App\Core\Announcement\Actions\GetAnnouncementDetailsAction;
use App\Core\Announcement\Enums\AnnouncementType;
use App\External\Api\Resources\Announcement\AdminAnnouncementDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EditAnnouncementController extends Controller
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

        return Inertia::render('Announcement/Admin/Form', [
            'announcement' => (new AdminAnnouncementDetailsResource($model))->resolve(),
            'types'        => AnnouncementType::toOptions(),
        ]);
    }
}
