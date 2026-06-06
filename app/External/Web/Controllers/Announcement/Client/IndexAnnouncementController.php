<?php

namespace App\External\Web\Controllers\Announcement\Client;

use App\Core\Announcement\Actions\GetClientAnnouncementsAction;
use App\External\Api\Resources\Announcement\ClientAnnouncementListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexAnnouncementController extends Controller
{
    public function __construct(
        private GetClientAnnouncementsAction $listAnnouncements,
    ) {
    }

    public function __invoke(): Response
    {
        $announcements = $this->listAnnouncements->execute(
            municipalId: app('municipal_id'),
            perPage: 20,
        );
        return Inertia::render('Announcement/Client/Index', [
            'announcements' => ClientAnnouncementListResource::collection($announcements),
        ]);
    }
}
