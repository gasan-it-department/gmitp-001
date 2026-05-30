<?php

namespace App\External\Web\Controllers\Announcement\Admin;

use App\Core\Announcement\Enums\AnnouncementType;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateAnnouncementController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Announcement/Admin/Form', [
            'announcement' => null,
            'types'        => AnnouncementType::toOptions(),
        ]);
    }
}
