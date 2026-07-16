<?php

namespace App\External\Api\Controllers\V1\Announcement;

use App\Core\Announcement\Actions\GetClientAnnouncementDetailsAction;
use App\External\Api\Resources\V1\Announcement\AnnouncementDetailsResource;
use App\Http\Controllers\Controller;

class ShowAnnouncementController extends Controller
{
    public function __construct(
        private GetClientAnnouncementDetailsAction $getAnnouncementDetails,
    ) {
    }

    public function __invoke(string $announcement): AnnouncementDetailsResource
    {
        $model = $this->getAnnouncementDetails->execute(
            municipalId: app('municipal_id'),
            id: $announcement,
        );

        return new AnnouncementDetailsResource($model);
    }
}
