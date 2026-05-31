<?php

namespace App\External\Api\Controllers\Event\Admin;

use App\Core\Event\Actions\TogglePublishEventAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class TogglePublishEventController extends Controller
{
    public function __construct(
        private TogglePublishEventAction $togglePublish,
    ) {
    }

    public function __invoke(string $event): RedirectResponse
    {
        $updated = $this->togglePublish->execute($event, app('municipal_id'));

        return back()->with(
            'success',
            $updated->is_published ? 'Event published.' : 'Event unpublished.',
        );
    }
}
