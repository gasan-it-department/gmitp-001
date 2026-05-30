<?php

namespace App\External\Api\Controllers\Announcement;

use App\Core\Announcement\Actions\TogglePublishAnnouncementAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class TogglePublishAnnouncementController extends Controller
{
    public function __construct(
        private TogglePublishAnnouncementAction $togglePublish,
    ) {
    }

    public function __invoke(string $announcement): RedirectResponse
    {
        $updated = $this->togglePublish->execute($announcement, app('municipal_id'));

        return back()->with(
            'success',
            $updated->is_published ? 'Announcement published.' : 'Announcement unpublished.',
        );
    }
}
