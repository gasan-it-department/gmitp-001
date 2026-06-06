<?php

namespace App\External\Api\Controllers\Announcement;

use App\Core\Announcement\Actions\DeleteAnnouncementAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeleteAnnouncementController extends Controller
{
    public function __construct(
        private DeleteAnnouncementAction $deleteAnnouncement,
    ) {
    }

    public function __invoke(string $announcement): RedirectResponse
    {
        $this->deleteAnnouncement->execute($announcement, app('municipal_id'));

        return back()->with('success', 'Announcement deleted.');
    }
}
