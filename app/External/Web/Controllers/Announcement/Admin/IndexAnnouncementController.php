<?php

namespace App\External\Web\Controllers\Announcement\Admin;

use App\Core\Announcement\Actions\GetAdminAnnouncementsAction;
use App\External\Api\Resources\Announcement\AdminAnnouncementListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexAnnouncementController extends Controller
{
    public function __construct(
        private GetAdminAnnouncementsAction $listAnnouncements,
    ) {
    }

    public function __invoke(): Response
    {
        $announcements = $this->listAnnouncements->execute(
            municipalId: app('municipal_id'),
            perPage: 20,
        );

        return Inertia::render('Announcement/Admin/Index', [
            'announcements' => AdminAnnouncementListResource::collection($announcements),
        ]);
    }
}
