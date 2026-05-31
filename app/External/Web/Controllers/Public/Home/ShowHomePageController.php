<?php

namespace App\External\Web\Controllers\Public\Home;

use App\Core\Announcement\Actions\GetClientAnnouncementsAction;
use App\External\Api\Resources\Announcement\ClientAnnouncementListResource;
use App\External\Api\Resources\Municipality\MunicipalBannerResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowHomePageController extends Controller
{
    public function __invoke(
        GetClientAnnouncementsAction $getClientAnnouncementsAction
    ): Response {
        $municipality = app('current_municipality');

        $banners = $municipality->banners()
            ->get();

        $announcements = $getClientAnnouncementsAction->execute(app('municipal_id'));

        return Inertia::render('Public/Home/HomePage', [
            'announcements' => ClientAnnouncementListResource::collection($announcements),
            'banners' => (MunicipalBannerResource::collection($banners))->resolve()
        ]);
    }
}
