<?php

namespace App\External\Web\Controllers\Event\Admin;

use App\Core\Event\Enums\EventType;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateEventController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Event/Admin/Form', [
            'event' => null,
            'types' => EventType::toOptions(),
        ]);
    }
}
