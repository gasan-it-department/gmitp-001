<?php

namespace App\External\Api\Controllers\Announcement;

use App\Core\Announcement\Actions\UpdateAnnouncementAction;
use App\Core\Announcement\Dto\UpdateAnnouncementDto;
use App\External\Api\Request\Announcement\UpdateAnnouncementRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateAnnouncementController extends Controller
{
    public function __construct(
        private UpdateAnnouncementAction $updateAnnouncement,
    ) {
    }

    public function __invoke(UpdateAnnouncementRequest $request, string $announcement): RedirectResponse
    {
        $this->updateAnnouncement->execute(
            $announcement,
            UpdateAnnouncementDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Announcement updated.');
    }
}
