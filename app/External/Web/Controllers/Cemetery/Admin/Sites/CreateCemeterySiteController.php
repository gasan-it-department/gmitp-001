<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Sites;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateCemeterySiteController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Cemetery/Admin/Site/Create/CreateCemeterySite', [
            'municipality' => app('current_municipality'),
        ]);
    }
}
