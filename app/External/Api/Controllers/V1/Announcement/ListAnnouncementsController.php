<?php

namespace App\External\Api\Controllers\V1\Announcement;

use App\Core\Announcement\Actions\GetClientAnnouncementsAction;
use App\External\Api\Resources\V1\Announcement\AnnouncementListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ListAnnouncementsController extends Controller
{
    public function __construct(
        private GetClientAnnouncementsAction $listAnnouncements,
    ) {
    }

    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->integer('per_page', 20), 50);

        $announcements = $this->listAnnouncements->execute(
            municipalId: app('municipal_id'),
            perPage: $perPage,
        );

        return AnnouncementListResource::collection($announcements);
    }
}
