<?php

namespace App\External\Api\Controllers\Announcement;

use App\Core\Announcement\Actions\StoreAnnouncementAction;
use App\Core\Announcement\Dto\StoreAnnouncementDto;
use App\External\Api\Request\Announcement\StoreAnnouncementRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreAnnouncementController extends Controller
{
    public function __construct(
        private StoreAnnouncementAction $storeAnnouncement,
    ) {
    }

    public function __invoke(StoreAnnouncementRequest $request): RedirectResponse
    {
        $this->storeAnnouncement->execute(
            StoreAnnouncementDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Announcement created.');
    }
}
