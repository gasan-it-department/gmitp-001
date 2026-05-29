<?php

namespace App\External\Web\Controllers\CommunityReport\Client;

use App\Core\CommunityReport\Enums\ReportCategory;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateReportController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('CitizenReport/Client/Create', [
            'categories' => ReportCategory::toOptions(),
        ]);
    }
}
