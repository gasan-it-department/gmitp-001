<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Reports;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexCemeteryReportsController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Cemetery/Admin/Reports/Index', [
            'municipality' => app('current_municipality'),
        ]);
    }
}
